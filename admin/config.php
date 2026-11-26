<?php
declare(strict_types=1);

/**
 * EXAMEN APROBADO - Admin Configuration & Security Helpers
 * Compatible con PHP 7.4+ / 8.x en hosting cPanel sin base de datos.
 */

define('EA_ROOT_DIR', dirname(__DIR__));
define('EA_DATA_FILE', EA_ROOT_DIR . '/data/content.json');
define('EA_BACKUP_FILE', EA_ROOT_DIR . '/data/content.backup.json');
define('EA_CREDENTIALS_FILE', __DIR__ . '/credentials.php');
define('EA_MAX_UPLOAD_BYTES', 8 * 1024 * 1024); // 8 MB

function ea_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);

    session_name('EA_ADMIN_SESS');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

function ea_get_credentials(): array
{
    if (file_exists(EA_CREDENTIALS_FILE)) {
        $creds = require EA_CREDENTIALS_FILE;
        if (is_array($creds) && !empty($creds['username']) && !empty($creds['password_hash'])) {
            return $creds;
        }
    }
    return ['username' => 'admin', 'password_hash' => ''];
}

function ea_save_credentials(string $username, string $newPassword): bool
{
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    if (!$hash) {
        return false;
    }
    $exportUser = var_export($username, true);
    $exportHash = var_export($hash, true);
    $php = "<?php\n// Credenciales del Panel Admin - Examen Aprobado\nreturn [\n    'username' => {$exportUser},\n    'password_hash' => {$exportHash},\n];\n";

    $tmp = EA_CREDENTIALS_FILE . '.tmp.' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $php, LOCK_EX) === false) {
        return false;
    }
    return rename($tmp, EA_CREDENTIALS_FILE);
}

function ea_verify_password(string $plain, string $stored, string $username): bool
{
    if ($stored === '') {
        return false;
    }

    // Soporte para hash inicial PBKDF2-SHA256 con actualización automática a bcrypt/password_hash
    if (strpos($stored, 'pbkdf2_sha256$') === 0) {
        $parts = explode('$', $stored);
        if (count($parts) !== 4) {
            return false;
        }
        $iterations = (int)$parts[1];
        $salt = $parts[2];
        $expectedHex = $parts[3];
        $computedHex = hash_pbkdf2('sha256', $plain, $salt, $iterations, 64, false);
        if (hash_equals($expectedHex, $computedHex)) {
            // Actualizar transparentemente a password_hash nativo de PHP
            @ea_save_credentials($username, $plain);
            return true;
        }
        return false;
    }

    return password_verify($plain, $stored);
}

function ea_is_authenticated(): bool
{
    return !empty($_SESSION['ea_admin_logged_in']) && $_SESSION['ea_admin_logged_in'] === true;
}

function ea_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ea_require_auth_and_csrf(): void
{
    if (!ea_is_authenticated()) {
        ea_json_response(['ok' => false, 'error' => 'Sesión expirada. Vuelve a iniciar sesión.'], 401);
    }
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['_csrf'] ?? '');
    $expected = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || !is_string($token) || !hash_equals($expected, $token)) {
        ea_json_response(['ok' => false, 'error' => 'Token de seguridad inválido. Recarga la página.'], 403);
    }
}

function ea_read_content(): array
{
    if (!file_exists(EA_DATA_FILE)) {
        return ['site' => [], 'testimonials' => [], 'gallery' => []];
    }
    $raw = file_get_contents(EA_DATA_FILE);
    $data = json_decode($raw ?: '{}', true);
    if (!is_array($data)) {
        return ['site' => [], 'testimonials' => [], 'gallery' => []];
    }
    $data['site'] = isset($data['site']) && is_array($data['site']) ? $data['site'] : [];
    $data['testimonials'] = isset($data['testimonials']) && is_array($data['testimonials']) ? array_values($data['testimonials']) : [];
    $data['gallery'] = isset($data['gallery']) && is_array($data['gallery']) ? array_values($data['gallery']) : [];
    return $data;
}

function ea_write_content(array $data): bool
{
    $dir = dirname(EA_DATA_FILE);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        return false;
    }

    if (file_exists(EA_DATA_FILE)) {
        @copy(EA_DATA_FILE, EA_BACKUP_FILE);
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }

    $tmp = EA_DATA_FILE . '.tmp.' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $json . "\n", LOCK_EX) === false) {
        return false;
    }
    return rename($tmp, EA_DATA_FILE);
}

function ea_slugify(string $text): string
{
    $text = mb_strtolower(trim($text), 'UTF-8');
    $map = [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
    ];
    $text = strtr($text, $map);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? 'foto';
    $text = trim($text, '-');
    return $text !== '' ? substr($text, 0, 48) : 'foto';
}

function ea_handle_image_upload(array $file, string $subFolder, string $prefix): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('No se pudo recibir la imagen subida (código ' . ($file['error'] ?? -1) . ').');
    }

    if (($file['size'] ?? 0) <= 0 || $file['size'] > EA_MAX_UPLOAD_BYTES) {
        throw new RuntimeException('La imagen debe pesar menos de 8 MB.');
    }

    $tmpPath = $file['tmp_name'] ?? '';
    if (!is_uploaded_file($tmpPath)) {
        throw new RuntimeException('Archivo de imagen inválido.');
    }

    $imgInfo = @getimagesize($tmpPath);
    if ($imgInfo === false) {
        throw new RuntimeException('El archivo seleccionado no es una imagen válida.');
    }

    $mime = $imgInfo['mime'] ?? '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_file($finfo, $tmpPath);
            finfo_close($finfo);
            if ($detected) {
                $mime = $detected;
            }
        }
    }

    $extMap = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    if (!isset($extMap[$mime])) {
        throw new RuntimeException('Formato no soportado. Usa JPG, PNG o WEBP.');
    }

    $ext = $extMap[$mime];
    $safeSub = preg_replace('/[^a-z0-9_-]/i', '', $subFolder);
    $targetDir = EA_ROOT_DIR . '/images/' . $safeSub;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
        throw new RuntimeException('No se pudo crear la carpeta de imágenes en el servidor.');
    }

    $filename = date('Ymd-His') . '-' . ea_slugify($prefix) . '-' . bin2hex(random_bytes(3)) . '.' . $ext;
    $destPath = $targetDir . '/' . $filename;

    if (!move_uploaded_file($tmpPath, $destPath)) {
        throw new RuntimeException('No se pudo guardar la imagen. Revisa los permisos de la carpeta images/ en cPanel.');
    }

    return 'images/' . $safeSub . '/' . $filename;
}
