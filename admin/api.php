<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
ea_start_session();

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($action === 'session') {
    $creds = ea_get_credentials();
    ea_json_response([
        'ok'            => true,
        'authenticated' => ea_is_authenticated(),
        'username'      => ea_is_authenticated() ? ($creds['username'] ?? 'admin') : null,
        'csrfToken'     => $_SESSION['csrf_token'] ?? '',
    ]);
}

if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ea_json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
    }

    $lockUntil = (int)($_SESSION['ea_lock_until'] ?? 0);
    if ($lockUntil > time()) {
        $wait = $lockUntil - time();
        ea_json_response(['ok' => false, 'error' => "Demasiados intentos fallidos. Espera {$wait} segundos."], 429);
    }

    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    $user = trim((string)($body['username'] ?? ''));
    $pass = (string)($body['password'] ?? '');

    $creds = ea_get_credentials();
    $validUser = hash_equals((string)$creds['username'], $user);
    $validPass = $validUser && ea_verify_password($pass, (string)$creds['password_hash'], $user);

    if (!$validPass) {
        $fails = (int)($_SESSION['ea_fail_count'] ?? 0) + 1;
        $_SESSION['ea_fail_count'] = $fails;
        if ($fails >= 5) {
            $_SESSION['ea_lock_until'] = time() + 60;
            $_SESSION['ea_fail_count'] = 0;
        }
        ea_json_response(['ok' => false, 'error' => 'Usuario o contraseña incorrectos.'], 401);
    }

    $_SESSION['ea_fail_count'] = 0;
    $_SESSION['ea_lock_until'] = 0;
    session_regenerate_id(true);
    $_SESSION['ea_admin_logged_in'] = true;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    ea_json_response([
        'ok'        => true,
        'username'  => $creds['username'],
        'csrfToken' => $_SESSION['csrf_token'],
    ]);
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
    }
    session_destroy();
    ea_json_response(['ok' => true]);
}

// Todas las demás acciones requieren sesión activa
if ($action === 'get_content') {
    if (!ea_is_authenticated()) {
        ea_json_response(['ok' => false, 'error' => 'No autorizado.'], 401);
    }
    ea_json_response(['ok' => true, 'data' => ea_read_content()]);
}

// Acciones de escritura requieren POST + sesión + CSRF
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ea_json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}
ea_require_auth_and_csrf();

try {
    if ($action === 'save_site') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        if (!is_array($body) || !isset($body['site']) || !is_array($body['site'])) {
            ea_json_response(['ok' => false, 'error' => 'Datos de configuración inválidos.'], 400);
        }

        $data = ea_read_content();
        $allowedKeys = [
            'announcementTag', 'announcementText', 'announcementCta',
            'heroTitleStart', 'heroTitleHighlight', 'heroTitleEnd',
            'heroDesc', 'heroLocationTitle', 'heroLocationDesc',
            'heroBadgeTitle', 'heroBadgeSubtitle',
            'testimonialsTitle', 'testimonialsSubtitle',
            'galleryBadge', 'galleryTitle', 'gallerySubtitle',
            'schoolTitle', 'philosophyLabel', 'philosophyQuote',
            'founderName', 'founderRole', 'founderBio', 'storyEyebrow',
            'address', 'phoneDisplay', 'whatsappNumber',
            'instagramHandle', 'instagramUrl', 'formEmail',
        ];

        foreach ($allowedKeys as $key) {
            if (array_key_exists($key, $body['site'])) {
                $data['site'][$key] = trim((string)$body['site'][$key]);
            }
        }

        if (isset($body['site']['storyParagraphs']) && is_array($body['site']['storyParagraphs'])) {
            $cleanParagraphs = [];
            foreach ($body['site']['storyParagraphs'] as $p) {
                $t = trim((string)$p);
                if ($t !== '') {
                    $cleanParagraphs[] = $t;
                }
            }
            if (!empty($cleanParagraphs)) {
                $data['site']['storyParagraphs'] = $cleanParagraphs;
            }
        }

        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo escribir data/content.json. Revisa los permisos de la carpeta data/ en cPanel.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'save_testimonial') {
        $id = trim((string)($_POST['id'] ?? ''));
        $name = trim((string)($_POST['name'] ?? ''));
        $degree = trim((string)($_POST['degree'] ?? ''));
        $badge = trim((string)($_POST['badge'] ?? 'Examen de Grado Aprobado'));
        $quote = trim((string)($_POST['quote'] ?? ''));
        $instagramUrl = trim((string)($_POST['instagramUrl'] ?? ''));
        $objectPosition = trim((string)($_POST['objectPosition'] ?? 'center 30%'));
        $insertPosition = trim((string)($_POST['insertPosition'] ?? 'top'));

        if ($name === '' || $quote === '') {
            ea_json_response(['ok' => false, 'error' => 'El nombre y el texto del testimonio son obligatorios.'], 400);
        }

        $data = ea_read_content();
        $uploadedPath = null;

        if (!empty($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $uploadedPath = ea_handle_image_upload($_FILES['image'], 'testimonios', $name);
        }

        $existingIdx = -1;
        if ($id !== '') {
            foreach ($data['testimonials'] as $i => $item) {
                if (($item['id'] ?? '') === $id) {
                    $existingIdx = $i;
                    break;
                }
            }
        }

        if ($existingIdx >= 0) {
            $current = $data['testimonials'][$existingIdx];
            $data['testimonials'][$existingIdx] = [
                'id'             => $id,
                'name'           => $name,
                'degree'         => $degree,
                'badge'          => $badge !== '' ? $badge : 'Examen de Grado Aprobado',
                'quote'          => $quote,
                'image'          => $uploadedPath ?? ($current['image'] ?? 'images/logo.jpg'),
                'objectPosition' => $objectPosition !== '' ? $objectPosition : 'center 30%',
                'instagramUrl'   => $instagramUrl !== '' ? $instagramUrl : ($data['site']['instagramUrl'] ?? 'https://www.instagram.com/examenaprobado/'),
            ];
        } else {
            if ($uploadedPath === null) {
                ea_json_response(['ok' => false, 'error' => 'Debes subir una imagen de vista previa para el nuevo testimonio.'], 400);
            }
            $newItem = [
                'id'             => 't-' . date('YmdHis') . '-' . bin2hex(random_bytes(2)),
                'name'           => $name,
                'degree'         => $degree,
                'badge'          => $badge !== '' ? $badge : 'Examen de Grado Aprobado',
                'quote'          => $quote,
                'image'          => $uploadedPath,
                'objectPosition' => $objectPosition !== '' ? $objectPosition : 'center 30%',
                'instagramUrl'   => $instagramUrl !== '' ? $instagramUrl : ($data['site']['instagramUrl'] ?? 'https://www.instagram.com/examenaprobado/'),
            ];
            if ($insertPosition === 'bottom') {
                $data['testimonials'][] = $newItem;
            } else {
                array_unshift($data['testimonials'], $newItem);
            }
        }

        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo guardar data/content.json.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'delete_testimonial') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        $id = trim((string)($body['id'] ?? ''));
        $data = ea_read_content();
        $data['testimonials'] = array_values(array_filter($data['testimonials'], static fn($t) => ($t['id'] ?? '') !== $id));
        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo guardar data/content.json.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'reorder_testimonials') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        $order = $body['order'] ?? [];
        if (!is_array($order)) {
            ea_json_response(['ok' => false, 'error' => 'Orden inválido.'], 400);
        }
        $data = ea_read_content();
        $byId = [];
        foreach ($data['testimonials'] as $item) {
            $byId[$item['id']] = $item;
        }
        $reordered = [];
        foreach ($order as $id) {
            if (isset($byId[$id])) {
                $reordered[] = $byId[$id];
                unset($byId[$id]);
            }
        }
        foreach ($byId as $remaining) {
            $reordered[] = $remaining;
        }
        $data['testimonials'] = $reordered;
        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo guardar data/content.json.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'save_gallery_item') {
        $id = trim((string)($_POST['id'] ?? ''));
        $tag = trim((string)($_POST['tag'] ?? ''));
        $alt = trim((string)($_POST['alt'] ?? ''));
        $objectPosition = trim((string)($_POST['objectPosition'] ?? 'center 25%'));
        $insertPosition = trim((string)($_POST['insertPosition'] ?? 'top'));

        if ($tag === '') {
            ea_json_response(['ok' => false, 'error' => 'Debes ingresar una etiqueta/título para la foto (ej. Grado Aprobado).'], 400);
        }

        $data = ea_read_content();
        $uploadedPath = null;
        if (!empty($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $uploadedPath = ea_handle_image_upload($_FILES['image'], 'galeria', $tag);
        }

        $existingIdx = -1;
        if ($id !== '') {
            foreach ($data['gallery'] as $i => $item) {
                if (($item['id'] ?? '') === $id) {
                    $existingIdx = $i;
                    break;
                }
            }
        }

        if ($existingIdx >= 0) {
            $current = $data['gallery'][$existingIdx];
            $data['gallery'][$existingIdx] = [
                'id'             => $id,
                'tag'            => $tag,
                'alt'            => $alt !== '' ? $alt : $tag,
                'image'          => $uploadedPath ?? ($current['image'] ?? 'images/logo.jpg'),
                'cropClass'      => $uploadedPath ? '' : ($current['cropClass'] ?? ''),
                'objectPosition' => $objectPosition !== '' ? $objectPosition : 'center 25%',
            ];
        } else {
            if ($uploadedPath === null) {
                ea_json_response(['ok' => false, 'error' => 'Debes seleccionar una foto para subir a la galería.'], 400);
            }
            $newItem = [
                'id'             => 'g-' . date('YmdHis') . '-' . bin2hex(random_bytes(2)),
                'tag'            => $tag,
                'alt'            => $alt !== '' ? $alt : $tag,
                'image'          => $uploadedPath,
                'cropClass'      => '',
                'objectPosition' => $objectPosition !== '' ? $objectPosition : 'center 25%',
            ];
            if ($insertPosition === 'bottom') {
                $data['gallery'][] = $newItem;
            } else {
                array_unshift($data['gallery'], $newItem);
            }
        }

        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo guardar data/content.json.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'delete_gallery_item') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        $id = trim((string)($body['id'] ?? ''));
        $data = ea_read_content();
        $data['gallery'] = array_values(array_filter($data['gallery'], static fn($g) => ($g['id'] ?? '') !== $id));
        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo guardar data/content.json.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'reorder_gallery') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        $order = $body['order'] ?? [];
        if (!is_array($order)) {
            ea_json_response(['ok' => false, 'error' => 'Orden inválido.'], 400);
        }
        $data = ea_read_content();
        $byId = [];
        foreach ($data['gallery'] as $item) {
            $byId[$item['id']] = $item;
        }
        $reordered = [];
        foreach ($order as $id) {
            if (isset($byId[$id])) {
                $reordered[] = $byId[$id];
                unset($byId[$id]);
            }
        }
        foreach ($byId as $remaining) {
            $reordered[] = $remaining;
        }
        $data['gallery'] = $reordered;
        if (!ea_write_content($data)) {
            throw new RuntimeException('No se pudo guardar data/content.json.');
        }
        ea_json_response(['ok' => true, 'data' => $data]);
    }

    if ($action === 'change_password') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        $currentPassword = (string)($body['currentPassword'] ?? '');
        $newUsername = trim((string)($body['newUsername'] ?? ''));
        $newPassword = (string)($body['newPassword'] ?? '');

        $creds = ea_get_credentials();
        if (!ea_verify_password($currentPassword, (string)$creds['password_hash'], (string)$creds['username'])) {
            ea_json_response(['ok' => false, 'error' => 'La contraseña actual no es correcta.'], 400);
        }
        if ($newUsername === '') {
            $newUsername = (string)$creds['username'];
        }
        if (strlen($newPassword) < 8) {
            ea_json_response(['ok' => false, 'error' => 'La nueva contraseña debe tener al menos 8 caracteres.'], 400);
        }
        if (!ea_save_credentials($newUsername, $newPassword)) {
            throw new RuntimeException('No se pudo actualizar admin/credentials.php.');
        }
        ea_json_response(['ok' => true, 'username' => $newUsername]);
    }

    ea_json_response(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
} catch (Throwable $e) {
    ea_json_response(['ok' => false, 'error' => $e->getMessage()], 500);
}
