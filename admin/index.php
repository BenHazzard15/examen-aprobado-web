<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
ea_start_session();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Panel Administrador | Examen Aprobado</title>
  <link rel="icon" type="image/jpeg" href="../images/logo.jpg">
  <link rel="stylesheet" href="admin.css">
</head>
<body>

  <!-- ======================================================================
       LOGIN SCREEN
       ====================================================================== -->
  <div id="login-view" class="login-screen" hidden>
    <div class="login-card">
      <div class="login-brand">
        <img src="../images/logo.jpg" alt="Logo Examen Aprobado" width="56" height="56">
        <div>
          <h1>Examen Aprobado</h1>
          <span>Panel de Administración</span>
        </div>
      </div>

      <form id="login-form" class="admin-form">
        <div class="field">
          <label for="login-user">Usuario</label>
          <input type="text" id="login-user" autocomplete="username" placeholder="admin" required>
        </div>

        <div class="field">
          <label for="login-pass">Contraseña</label>
          <input type="password" id="login-pass" autocomplete="current-password" placeholder="••••••••••••" required>
        </div>

        <div id="login-error" class="alert-error" hidden></div>

        <button type="submit" id="login-btn" class="btn-gold btn-full">Iniciar Sesión</button>
      </form>

      <div class="login-footer">
        <a href="../">&larr; Volver al sitio público</a>
      </div>
    </div>
  </div>

  <!-- ======================================================================
       DASHBOARD VIEW
       ====================================================================== -->
  <div id="dashboard-view" class="admin-shell" hidden>

    <header class="admin-topbar">
      <div class="topbar-inner">
        <div class="topbar-brand">
          <img src="../images/logo.jpg" alt="Logo" width="40" height="40">
          <div>
            <strong>Examen Aprobado</strong>
            <span>Administrador Web</span>
          </div>
        </div>

        <div class="topbar-actions">
          <a href="../" target="_blank" rel="noopener noreferrer" class="btn-outline">Ver sitio en vivo &#8599;</a>
          <button type="button" id="logout-btn" class="btn-ghost">Cerrar sesión</button>
        </div>
      </div>
    </header>

    <nav class="admin-tabs-bar" aria-label="Secciones del administrador">
      <div class="tabs-inner">
        <button type="button" class="tab-btn active" data-tab="testimonials">
          Testimonios <span class="tab-count" id="count-testimonials">0</span>
        </button>
        <button type="button" class="tab-btn" data-tab="gallery">
          Galería <span class="tab-count" id="count-gallery">0</span>
        </button>
        <button type="button" class="tab-btn" data-tab="site">
          Textos y Datos Web
        </button>
        <button type="button" class="tab-btn" data-tab="security">
          Seguridad
        </button>
      </div>
    </nav>

    <main class="admin-main">

      <!-- TAB 1: TESTIMONIALS -->
      <section class="tab-panel active" id="panel-testimonials">
        <div class="panel-header">
          <div>
            <h2>Testimonios de Estudiantes</h2>
            <p>Agrega nuevos testimonios con su foto, grado, logro y link a Instagram, edita cualquiera o cambia el orden en que aparecen.</p>
          </div>
          <button type="button" class="btn-gold" id="btn-new-testimonial">+ Nuevo Testimonio</button>
        </div>

        <div class="items-list" id="testimonials-list"></div>
      </section>

      <!-- TAB 2: GALLERY -->
      <section class="tab-panel" id="panel-gallery">
        <div class="panel-header">
          <div>
            <h2>Galería de Momentos</h2>
            <p>Sube nuevas fotos desde tu computador o celular, edita su etiqueta o reordénalas.</p>
          </div>
          <button type="button" class="btn-gold" id="btn-new-gallery">+ Subir Nueva Foto</button>
        </div>

        <div class="gallery-admin-grid" id="gallery-list"></div>
      </section>

      <!-- TAB 3: SITE TEXTS & BASIC SETTINGS -->
      <section class="tab-panel" id="panel-site">
        <div class="panel-header">
          <div>
            <h2>Textos y Datos Básicos de la Web</h2>
            <p>Modifica los avisos de inscripción, portada, filosofía, historia y datos de contacto.</p>
          </div>
          <button type="submit" form="site-settings-form" class="btn-gold" id="btn-save-site-top">Guardar Cambios</button>
        </div>

        <form id="site-settings-form" class="settings-stack">

          <div class="settings-card">
            <h3>Barra Superior (Pre-Header)</h3>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-announcementTag">Etiqueta destacada (ej. Agenda tu cupo...)</label>
                <input type="text" id="s-announcementTag" name="announcementTag">
              </div>
              <div class="field">
                <label for="s-announcementCta">Texto del enlace</label>
                <input type="text" id="s-announcementCta" name="announcementCta">
              </div>
            </div>
            <div class="field">
              <label for="s-announcementText">Mensaje principal del pre-header</label>
              <input type="text" id="s-announcementText" name="announcementText">
            </div>
          </div>

          <div class="settings-card">
            <h3>Portada (Hero)</h3>
            <div class="form-grid-3">
              <div class="field">
                <label for="s-heroTitleStart">Título (parte 1)</label>
                <input type="text" id="s-heroTitleStart" name="heroTitleStart">
              </div>
              <div class="field">
                <label for="s-heroTitleHighlight">Título destacado (dorado)</label>
                <input type="text" id="s-heroTitleHighlight" name="heroTitleHighlight">
              </div>
              <div class="field">
                <label for="s-heroTitleEnd">Título (parte final)</label>
                <input type="text" id="s-heroTitleEnd" name="heroTitleEnd">
              </div>
            </div>
            <div class="field">
              <label for="s-heroDesc">Subtítulo de la portada</label>
              <textarea id="s-heroDesc" name="heroDesc" rows="3"></textarea>
            </div>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-heroLocationTitle">Título modalidad / cobertura</label>
                <input type="text" id="s-heroLocationTitle" name="heroLocationTitle">
              </div>
              <div class="field">
                <label for="s-heroLocationDesc">Detalle sede presencial</label>
                <input type="text" id="s-heroLocationDesc" name="heroLocationDesc">
              </div>
            </div>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-heroBadgeTitle">Globo sobre foto (título)</label>
                <input type="text" id="s-heroBadgeTitle" name="heroBadgeTitle">
              </div>
              <div class="field">
                <label for="s-heroBadgeSubtitle">Globo sobre foto (subtítulo)</label>
                <input type="text" id="s-heroBadgeSubtitle" name="heroBadgeSubtitle">
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3>Encabezados de Testimonios y Galería</h3>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-testimonialsTitle">Título de Testimonios</label>
                <input type="text" id="s-testimonialsTitle" name="testimonialsTitle">
              </div>
              <div class="field">
                <label for="s-galleryTitle">Título de Galería</label>
                <input type="text" id="s-galleryTitle" name="galleryTitle">
              </div>
            </div>
            <div class="field">
              <label for="s-testimonialsSubtitle">Subtítulo de Testimonios</label>
              <textarea id="s-testimonialsSubtitle" name="testimonialsSubtitle" rows="2"></textarea>
            </div>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-galleryBadge">Etiqueta superior de Galería</label>
                <input type="text" id="s-galleryBadge" name="galleryBadge">
              </div>
              <div class="field">
                <label for="s-gallerySubtitle">Subtítulo de Galería</label>
                <input type="text" id="s-gallerySubtitle" name="gallerySubtitle">
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3>Nuestra Escuela, Filosofía e Historia</h3>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-schoolTitle">Título de la sección</label>
                <input type="text" id="s-schoolTitle" name="schoolTitle">
              </div>
              <div class="field">
                <label for="s-philosophyLabel">Etiqueta de Filosofía</label>
                <input type="text" id="s-philosophyLabel" name="philosophyLabel">
              </div>
            </div>
            <div class="field">
              <label for="s-philosophyQuote">Cita de Nuestra Filosofía</label>
              <textarea id="s-philosophyQuote" name="philosophyQuote" rows="2"></textarea>
            </div>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-founderName">Nombre del fundador</label>
                <input type="text" id="s-founderName" name="founderName">
              </div>
              <div class="field">
                <label for="s-founderRole">Cargo</label>
                <input type="text" id="s-founderRole" name="founderRole">
              </div>
            </div>
            <div class="field">
              <label for="s-founderBio">Reseña breve debajo de la foto</label>
              <textarea id="s-founderBio" name="founderBio" rows="2"></textarea>
            </div>
            <div class="field">
              <label for="s-storyEyebrow">Encabezado de Historia</label>
              <input type="text" id="s-storyEyebrow" name="storyEyebrow">
            </div>
            <div class="field">
              <label for="s-storyParagraphs">Párrafos de Nuestra Historia (separa cada párrafo con una línea en blanco)</label>
              <textarea id="s-storyParagraphs" name="storyParagraphs" rows="14"></textarea>
            </div>
          </div>

          <div class="settings-card">
            <h3>Contacto y Correo del Formulario</h3>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-formEmail">Correo destino del formulario de reserva</label>
                <input type="email" id="s-formEmail" name="formEmail" placeholder="examenaprobadocl@gmail.com">
              </div>
              <div class="field">
                <label for="s-phoneDisplay">Teléfono visible</label>
                <input type="text" id="s-phoneDisplay" name="phoneDisplay">
              </div>
            </div>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-whatsappNumber">Número WhatsApp (solo dígitos, ej. 56987188165)</label>
                <input type="text" id="s-whatsappNumber" name="whatsappNumber">
              </div>
              <div class="field">
                <label for="s-instagramHandle">Usuario de Instagram</label>
                <input type="text" id="s-instagramHandle" name="instagramHandle">
              </div>
            </div>
            <div class="form-grid-2">
              <div class="field">
                <label for="s-instagramUrl">Enlace oficial de Instagram</label>
                <input type="url" id="s-instagramUrl" name="instagramUrl">
              </div>
              <div class="field">
                <label for="s-address">Dirección de la oficina</label>
                <input type="text" id="s-address" name="address">
              </div>
            </div>
          </div>

          <div class="settings-actions">
            <button type="submit" class="btn-gold">Guardar Todos los Cambios</button>
          </div>
        </form>
      </section>

      <!-- TAB 4: SECURITY -->
      <section class="tab-panel" id="panel-security">
        <div class="panel-header">
          <div>
            <h2>Seguridad y Contraseña</h2>
            <p>Cambia el usuario y la contraseña de acceso al panel administrador.</p>
          </div>
        </div>

        <form id="password-form" class="settings-card" style="max-width: 520px;">
          <div class="field">
            <label for="sec-user">Usuario administrador</label>
            <input type="text" id="sec-user" required>
          </div>
          <div class="field">
            <label for="sec-current">Contraseña actual</label>
            <input type="password" id="sec-current" autocomplete="current-password" required>
          </div>
          <div class="field">
            <label for="sec-new">Nueva contraseña (mínimo 8 caracteres)</label>
            <input type="password" id="sec-new" autocomplete="new-password" minlength="8" required>
          </div>
          <div class="field">
            <label for="sec-confirm">Repetir nueva contraseña</label>
            <input type="password" id="sec-confirm" autocomplete="new-password" minlength="8" required>
          </div>
          <button type="submit" class="btn-gold">Actualizar Credenciales</button>
        </form>
      </section>

    </main>
  </div>

  <!-- ======================================================================
       MODAL: ADD / EDIT TESTIMONIAL
       ====================================================================== -->
  <div class="modal-backdrop" id="testimonial-modal" hidden>
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 id="t-modal-title">Nuevo Testimonio</h3>
        <button type="button" class="modal-close" data-close-modal>&times;</button>
      </div>
      <form id="testimonial-form" class="modal-body" enctype="multipart/form-data">
        <input type="hidden" id="t-id" name="id">

        <div class="modal-two-col">
          <div class="modal-fields">
            <div class="field">
              <label for="t-name">Nombre de la persona *</label>
              <input type="text" id="t-name" name="name" placeholder="Ej. Fernando Edwards" required>
            </div>

            <div class="field">
              <label for="t-degree">Grado / Subtítulo *</label>
              <input type="text" id="t-degree" name="degree" placeholder="Ej. Licenciado en Derecho • @usuario" required>
            </div>

            <div class="field">
              <label for="t-badge">Título / Logro (etiqueta verde) *</label>
              <input type="text" id="t-badge" name="badge" placeholder="Ej. Examen de Grado Aprobado" value="Examen de Grado Aprobado" required>
            </div>

            <div class="field">
              <label for="t-instagram">Link al post de Instagram *</label>
              <input type="url" id="t-instagram" name="instagramUrl" placeholder="https://www.instagram.com/p/..." required>
            </div>

            <div class="field">
              <label for="t-quote">Texto del testimonio *</label>
              <textarea id="t-quote" name="quote" rows="5" placeholder="Escribe aquí la experiencia del estudiante..." required></textarea>
            </div>

            <div class="field" id="t-insert-pos-group">
              <label for="t-insert-pos">¿Dónde ubicarlo?</label>
              <select id="t-insert-pos" name="insertPosition">
                <option value="top">Al principio (primero en verse)</option>
                <option value="bottom">Al final de la lista</option>
              </select>
            </div>
          </div>

          <div class="modal-preview-col">
            <label class="preview-title">Vista previa de la foto (proporción real)</label>
            <div class="live-photo-frame ratio-testimonial">
              <img id="t-preview-img" src="../images/logo.jpg" alt="Vista previa" style="object-position: center 25%;">
            </div>

            <div class="field" style="margin-top: 12px;">
              <label for="t-image">Subir imagen (JPG, PNG o WEBP, máx. 8 MB)</label>
              <input type="file" id="t-image" name="image" accept="image/jpeg,image/png,image/webp">
              <small id="t-image-hint" class="field-hint">Obligatoria al crear; opcional al editar si quieres mantener la foto actual.</small>
            </div>

            <div class="field">
              <label for="t-pos-range">Encuadre vertical del rostro: <strong id="t-pos-label">25%</strong></label>
              <input type="range" id="t-pos-range" min="0" max="100" value="25">
              <div class="range-labels">
                <span>Arriba (0%)</span>
                <span>Centro (50%)</span>
                <span>Abajo (100%)</span>
              </div>
              <input type="hidden" id="t-object-position" name="objectPosition" value="center 25%">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-ghost" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-gold" id="t-save-btn">Guardar Testimonio</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ======================================================================
       MODAL: ADD / EDIT GALLERY PHOTO
       ====================================================================== -->
  <div class="modal-backdrop" id="gallery-modal" hidden>
    <div class="modal-dialog modal-sm">
      <div class="modal-header">
        <h3 id="g-modal-title">Subir Nueva Foto a la Galería</h3>
        <button type="button" class="modal-close" data-close-modal>&times;</button>
      </div>
      <form id="gallery-form" class="modal-body" enctype="multipart/form-data">
        <input type="hidden" id="g-id" name="id">

        <div class="live-photo-frame ratio-gallery" style="max-width: 240px; margin: 0 auto 14px;">
          <img id="g-preview-img" src="../images/logo.jpg" alt="Vista previa galería" style="object-position: center 22%;">
        </div>

        <div class="field">
          <label for="g-image">Seleccionar foto (JPG, PNG o WEBP, máx. 8 MB)</label>
          <input type="file" id="g-image" name="image" accept="image/jpeg,image/png,image/webp">
        </div>

        <div class="field">
          <label for="g-tag">Etiqueta / Título sobre la foto *</label>
          <input type="text" id="g-tag" name="tag" placeholder="Ej. Grado Aprobado, Clases de Repaso, Éxito Compartido" required>
        </div>

        <div class="field">
          <label for="g-alt">Descripción breve (opcional)</label>
          <input type="text" id="g-alt" name="alt" placeholder="Ej. Alumnos celebrando aprobación de grado">
        </div>

        <div class="field">
          <label for="g-pos-range">Encuadre vertical: <strong id="g-pos-label">22%</strong></label>
          <input type="range" id="g-pos-range" min="0" max="100" value="22">
          <input type="hidden" id="g-object-position" name="objectPosition" value="center 22%">
        </div>

        <div class="field" id="g-insert-pos-group">
          <label for="g-insert-pos">¿Dónde ubicarla?</label>
          <select id="g-insert-pos" name="insertPosition">
            <option value="top">Al principio (primera en verse)</option>
            <option value="bottom">Al final de la galería</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-ghost" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-gold" id="g-save-btn">Guardar Foto</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast -->
  <div id="admin-toast" class="admin-toast" role="status" aria-live="polite"></div>

  <script src="admin.js"></script>
</body>
</html>
