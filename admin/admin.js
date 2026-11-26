/**
 * EXAMEN APROBADO - Admin Panel Controller
 */

const state = {
  csrfToken: '',
  username: 'admin',
  data: { site: {}, testimonials: [], gallery: [] }
};

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  checkSession();
});

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolvePreviewPath(src) {
  if (!src) return '../images/logo.jpg';
  if (/^(https?:\/\/|data:|blob:|\.\.\/)/i.test(src)) return src;
  return `../${src}`;
}

function parseVerticalPercent(pos) {
  const m = String(pos || '').match(/(\d+)%/);
  return m ? Math.min(100, Math.max(0, parseInt(m[1], 10))) : 25;
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('admin-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
}

async function apiJson(action, payload = null, method = 'POST') {
  const opts = {
    method,
    headers: { 'Accept': 'application/json' }
  };
  if (method !== 'GET') {
    opts.headers['Content-Type'] = 'application/json';
    opts.headers['X-CSRF-Token'] = state.csrfToken;
    opts.body = JSON.stringify(payload || {});
  }
  const res = await fetch(`api.php?action=${encodeURIComponent(action)}`, opts);
  const data = await res.json().catch(() => ({ ok: false, error: 'Respuesta inválida del servidor PHP.' }));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Error de servidor');
  }
  return data;
}

async function apiForm(action, formData) {
  const res = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'X-CSRF-Token': state.csrfToken
    },
    body: formData
  });
  const data = await res.json().catch(() => ({ ok: false, error: 'Respuesta inválida del servidor PHP.' }));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Error al guardar');
  }
  return data;
}

async function checkSession() {
  try {
    const res = await apiJson('session', null, 'GET');
    state.csrfToken = res.csrfToken || '';
    if (res.authenticated) {
      state.username = res.username || 'admin';
      showDashboard();
      await loadContent();
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin('Este panel requiere ejecutarse en un servidor con PHP (como tu hosting cPanel).');
  }
}

function showLogin(errorMsg = '') {
  document.getElementById('login-view').hidden = false;
  document.getElementById('dashboard-view').hidden = true;
  const errEl = document.getElementById('login-error');
  if (errorMsg) {
    errEl.textContent = errorMsg;
    errEl.hidden = false;
  } else {
    errEl.hidden = true;
  }
}

function showDashboard() {
  document.getElementById('login-view').hidden = true;
  document.getElementById('dashboard-view').hidden = false;
  const secUser = document.getElementById('sec-user');
  if (secUser) secUser.value = state.username;
}

async function loadContent() {
  const res = await apiJson('get_content', null, 'GET');
  state.data = res.data;
  renderAll();
}

function renderAll() {
  renderTestimonials();
  renderGallery();
  populateSiteForm();
}

/* ==========================================================================
   RENDER TESTIMONIALS
   ========================================================================== */
function renderTestimonials() {
  const list = document.getElementById('testimonials-list');
  const count = document.getElementById('count-testimonials');
  const items = state.data.testimonials || [];
  if (count) count.textContent = String(items.length);
  if (!list) return;

  list.innerHTML = items.map((t, idx) => `
    <div class="item-row" data-id="${escapeHtml(t.id)}">
      <div class="item-thumb">
        <img src="${escapeHtml(resolvePreviewPath(t.image))}" alt="${escapeHtml(t.name)}" style="object-position: ${escapeHtml(t.objectPosition || 'center 25%')};">
      </div>
      <div class="item-info">
        <div class="item-info-top">
          <span class="item-order-pill">#${idx + 1}</span>
          <h3>${escapeHtml(t.name)}</h3>
          <span class="item-badge-pill">${escapeHtml(t.badge || '')}</span>
        </div>
        <div class="item-degree">${escapeHtml(t.degree || '')}</div>
        <div class="item-quote">“${escapeHtml(t.quote || '')}”</div>
      </div>
      <div class="item-actions">
        <button type="button" class="btn-sm" data-t-move="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Subir">↑</button>
        <button type="button" class="btn-sm" data-t-move="down" data-idx="${idx}" ${idx === items.length - 1 ? 'disabled' : ''} title="Bajar">↓</button>
        <button type="button" class="btn-sm" data-t-edit="${escapeHtml(t.id)}">Editar</button>
        <button type="button" class="btn-sm btn-sm-danger" data-t-del="${escapeHtml(t.id)}">Eliminar</button>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   RENDER GALLERY
   ========================================================================== */
function renderGallery() {
  const grid = document.getElementById('gallery-list');
  const count = document.getElementById('count-gallery');
  const items = state.data.gallery || [];
  if (count) count.textContent = String(items.length);
  if (!grid) return;

  grid.innerHTML = items.map((g, idx) => `
    <div class="gallery-admin-card" data-id="${escapeHtml(g.id)}">
      <div class="gallery-admin-photo">
        <img src="${escapeHtml(resolvePreviewPath(g.image))}" alt="${escapeHtml(g.alt || g.tag)}" style="object-position: ${escapeHtml(g.objectPosition || 'center 22%')};">
        <span class="gallery-admin-num">#${idx + 1}</span>
      </div>
      <div class="gallery-admin-body">
        <div class="gallery-admin-tag">${escapeHtml(g.tag || '')}</div>
        <div class="item-actions" style="justify-content: flex-start;">
          <button type="button" class="btn-sm" data-g-move="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Mover antes">←</button>
          <button type="button" class="btn-sm" data-g-move="down" data-idx="${idx}" ${idx === items.length - 1 ? 'disabled' : ''} title="Mover después">→</button>
          <button type="button" class="btn-sm" data-g-edit="${escapeHtml(g.id)}">Editar</button>
          <button type="button" class="btn-sm btn-sm-danger" data-g-del="${escapeHtml(g.id)}">Borrar</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   POPULATE SITE FORM
   ========================================================================== */
function populateSiteForm() {
  const site = state.data.site || {};
  const form = document.getElementById('site-settings-form');
  if (!form) return;

  Object.keys(site).forEach(key => {
    if (key === 'storyParagraphs') return;
    const input = form.querySelector(`[name="${key}"]`);
    if (input) input.value = site[key] ?? '';
  });

  const storyEl = document.getElementById('s-storyParagraphs');
  if (storyEl && Array.isArray(site.storyParagraphs)) {
    storyEl.value = site.storyParagraphs.join('\n\n');
  }
}

/* ==========================================================================
   MODALS
   ========================================================================== */
function openTestimonialModal(item = null) {
  const modal = document.getElementById('testimonial-modal');
  const form = document.getElementById('testimonial-form');
  form.reset();

  document.getElementById('t-modal-title').textContent = item ? `Editar testimonio: ${item.name}` : 'Nuevo Testimonio';
  document.getElementById('t-id').value = item ? item.id : '';
  document.getElementById('t-name').value = item ? item.name : '';
  document.getElementById('t-degree').value = item ? item.degree : 'Licenciado en Derecho';
  document.getElementById('t-badge').value = item ? item.badge : 'Examen de Grado Aprobado';
  document.getElementById('t-instagram').value = item ? item.instagramUrl : '';
  document.getElementById('t-quote').value = item ? item.quote : '';

  const pct = item ? parseVerticalPercent(item.objectPosition) : 25;
  setTestimonialPosition(pct);

  const previewImg = document.getElementById('t-preview-img');
  previewImg.src = item ? resolvePreviewPath(item.image) : '../images/logo.jpg';

  document.getElementById('t-image').required = !item;
  document.getElementById('t-insert-pos-group').hidden = Boolean(item);
  modal.hidden = false;
}

function setTestimonialPosition(pct) {
  const val = `center ${pct}%`;
  document.getElementById('t-pos-range').value = String(pct);
  document.getElementById('t-pos-label').textContent = `${pct}%`;
  document.getElementById('t-object-position').value = val;
  document.getElementById('t-preview-img').style.objectPosition = val;
}

function openGalleryModal(item = null) {
  const modal = document.getElementById('gallery-modal');
  const form = document.getElementById('gallery-form');
  form.reset();

  document.getElementById('g-modal-title').textContent = item ? 'Editar Foto de Galería' : 'Subir Nueva Foto a la Galería';
  document.getElementById('g-id').value = item ? item.id : '';
  document.getElementById('g-tag').value = item ? item.tag : '';
  document.getElementById('g-alt').value = item ? item.alt : '';

  const pct = item ? parseVerticalPercent(item.objectPosition) : 22;
  setGalleryPosition(pct);

  const previewImg = document.getElementById('g-preview-img');
  previewImg.src = item ? resolvePreviewPath(item.image) : '../images/logo.jpg';

  document.getElementById('g-image').required = !item;
  document.getElementById('g-insert-pos-group').hidden = Boolean(item);
  modal.hidden = false;
}

function setGalleryPosition(pct) {
  const val = `center ${pct}%`;
  document.getElementById('g-pos-range').value = String(pct);
  document.getElementById('g-pos-label').textContent = `${pct}%`;
  document.getElementById('g-object-position').value = val;
  document.getElementById('g-preview-img').style.objectPosition = val;
}

function closeModals() {
  document.getElementById('testimonial-modal').hidden = true;
  document.getElementById('gallery-modal').hidden = true;
}

/* ==========================================================================
   EVENT BINDINGS
   ========================================================================== */
function bindEvents() {
  // Login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errEl = document.getElementById('login-error');
    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
      const res = await apiJson('login', {
        username: document.getElementById('login-user').value.trim(),
        password: document.getElementById('login-pass').value
      });
      state.csrfToken = res.csrfToken;
      state.username = res.username;
      showDashboard();
      await loadContent();
      showToast('Sesión iniciada correctamente.');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar Sesión';
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await apiJson('logout', {});
    } catch (_) {}
    showLogin();
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${btn.dataset.tab}`)?.classList.add('active');
    });
  });

  // Close modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // Open New Modals
  document.getElementById('btn-new-testimonial').addEventListener('click', () => openTestimonialModal(null));
  document.getElementById('btn-new-gallery').addEventListener('click', () => openGalleryModal(null));

  // Live image preview & framing sliders
  document.getElementById('t-image').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      document.getElementById('t-preview-img').src = URL.createObjectURL(file);
    }
  });
  document.getElementById('t-pos-range').addEventListener('input', (e) => {
    setTestimonialPosition(parseInt(e.target.value, 10));
  });

  document.getElementById('g-image').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      document.getElementById('g-preview-img').src = URL.createObjectURL(file);
    }
  });
  document.getElementById('g-pos-range').addEventListener('input', (e) => {
    setGalleryPosition(parseInt(e.target.value, 10));
  });

  // Save Testimonial
  document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('t-save-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
      const fd = new FormData(e.target);
      const res = await apiForm('save_testimonial', fd);
      state.data = res.data;
      renderTestimonials();
      closeModals();
      showToast('Testimonio guardado y publicado en la web.');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar Testimonio';
    }
  });

  // Testimonial list actions (edit, delete, reorder)
  document.getElementById('testimonials-list').addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-t-edit]');
    if (editBtn) {
      const item = state.data.testimonials.find(t => t.id === editBtn.dataset.tEdit);
      if (item) openTestimonialModal(item);
      return;
    }

    const delBtn = e.target.closest('[data-t-del]');
    if (delBtn) {
      const id = delBtn.dataset.tDel;
      const item = state.data.testimonials.find(t => t.id === id);
      if (!confirm(`¿Seguro que deseas eliminar el testimonio de ${item?.name || 'este estudiante'}?`)) return;
      try {
        const res = await apiJson('delete_testimonial', { id });
        state.data = res.data;
        renderTestimonials();
        showToast('Testimonio eliminado.');
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
      return;
    }

    const moveBtn = e.target.closest('[data-t-move]');
    if (moveBtn) {
      const idx = parseInt(moveBtn.dataset.idx, 10);
      const dir = moveBtn.dataset.tMove === 'up' ? -1 : 1;
      const target = idx + dir;
      const arr = [...state.data.testimonials];
      if (target < 0 || target >= arr.length) return;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      try {
        const res = await apiJson('reorder_testimonials', { order: arr.map(i => i.id) });
        state.data = res.data;
        renderTestimonials();
        showToast('Orden de testimonios actualizado.');
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
    }
  });

  // Save Gallery Photo
  document.getElementById('gallery-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('g-save-btn');
    btn.disabled = true;
    btn.textContent = 'Subiendo...';
    try {
      const fd = new FormData(e.target);
      const res = await apiForm('save_gallery_item', fd);
      state.data = res.data;
      renderGallery();
      closeModals();
      showToast('Foto guardada en la galería.');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar Foto';
    }
  });

  // Gallery actions
  document.getElementById('gallery-list').addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-g-edit]');
    if (editBtn) {
      const item = state.data.gallery.find(g => g.id === editBtn.dataset.gEdit);
      if (item) openGalleryModal(item);
      return;
    }

    const delBtn = e.target.closest('[data-g-del]');
    if (delBtn) {
      const id = delBtn.dataset.gDel;
      if (!confirm('¿Seguro que deseas quitar esta foto de la galería?')) return;
      try {
        const res = await apiJson('delete_gallery_item', { id });
        state.data = res.data;
        renderGallery();
        showToast('Foto eliminada de la galería.');
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
      return;
    }

    const moveBtn = e.target.closest('[data-g-move]');
    if (moveBtn) {
      const idx = parseInt(moveBtn.dataset.idx, 10);
      const dir = moveBtn.dataset.gMove === 'up' ? -1 : 1;
      const target = idx + dir;
      const arr = [...state.data.gallery];
      if (target < 0 || target >= arr.length) return;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      try {
        const res = await apiJson('reorder_gallery', { order: arr.map(i => i.id) });
        state.data = res.data;
        renderGallery();
        showToast('Orden de la galería actualizado.');
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
    }
  });

  // Save Site Texts
  document.getElementById('site-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const site = {};
    for (const [k, v] of fd.entries()) {
      if (k === 'storyParagraphs') {
        site.storyParagraphs = String(v).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      } else {
        site[k] = String(v).trim();
      }
    }
    try {
      const res = await apiJson('save_site', { site });
      state.data = res.data;
      showToast('Textos y datos guardados en la web.');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  });

  // Change Password
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('sec-new').value;
    const confirmPassword = document.getElementById('sec-confirm').value;
    if (newPassword !== confirmPassword) {
      showToast('Error: Las contraseñas nuevas no coinciden.');
      return;
    }
    try {
      const res = await apiJson('change_password', {
        newUsername: document.getElementById('sec-user').value.trim(),
        currentPassword: document.getElementById('sec-current').value,
        newPassword
      });
      state.username = res.username;
      e.target.reset();
      document.getElementById('sec-user').value = state.username;
      showToast('Credenciales actualizadas correctamente.');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  });
}
