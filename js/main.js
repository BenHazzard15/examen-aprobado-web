/**
 * EXAMEN APROBADO - Interactive Controller
 * Modern UI/UX interactions, mobile navigation, gallery lightbox, forms, and WhatsApp integration.
 */

document.addEventListener('DOMContentLoaded', async () => {
  initStickyHeader();
  initMobileMenu();
  initActiveNavSpy();
  await hydrateFromCms();
  initGalleryPagination();
  initTestimonialsCarousel();
  initLightbox();
  initFaqAccordion();
  initForms();
  initCookieBanner();
});

/* ==========================================================================
   0. DYNAMIC CMS HYDRATION (data/content.json con respaldo estático en HTML)
   ========================================================================== */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url, fallback = '#') {
  const val = String(url ?? '').trim();
  if (!val) return fallback;
  if (/^(https?:\/\/|\/|images\/|#)/i.test(val)) return val;
  return fallback;
}

async function hydrateFromCms() {
  try {
    const res = await fetch(`data/content.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || typeof data !== 'object') return;

    const site = data.site || {};

    // 1. Pre-Header & Hero
    const setText = (selector, value) => {
      if (typeof value !== 'string') return;
      document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
    };

    setText('.announcement-tag', site.announcementTag);
    const annTextEl = document.querySelector('.announcement-content > span:not(.announcement-tag)');
    if (annTextEl && site.announcementText) annTextEl.textContent = site.announcementText;
    const annLink = document.querySelector('.announcement-link');
    if (annLink && site.announcementCta) annLink.innerHTML = `${escapeHtml(site.announcementCta)} &rarr;`;

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && (site.heroTitleStart || site.heroTitleHighlight || site.heroTitleEnd)) {
      heroTitle.innerHTML = `${escapeHtml(site.heroTitleStart || '')} <span>${escapeHtml(site.heroTitleHighlight || '')}</span> ${escapeHtml(site.heroTitleEnd || '')}`.trim();
    }
    setText('.hero-desc', site.heroDesc);
    setText('.hero-trust-proof .proof-text strong', site.heroLocationTitle);
    setText('.hero-trust-proof .proof-text span', site.heroLocationDesc);
    setText('.floating-badge-bottom .badge-text-title', site.heroBadgeTitle);
    setText('.floating-badge-bottom .badge-text-subtitle', site.heroBadgeSubtitle);

    // 2. Section headers & Nuestra Escuela
    setText('#testimonios .section-title', site.testimonialsTitle);
    setText('#testimonios .section-subtitle', site.testimonialsSubtitle);
    setText('#galeria .section-badge span', site.galleryBadge);
    setText('#galeria .section-title', site.galleryTitle);
    setText('#galeria .section-subtitle', site.gallerySubtitle);
    setText('#escuela .section-title', site.schoolTitle);
    setText('#escuela .philosophy-label', site.philosophyLabel);
    setText('#escuela .philosophy-quote', site.philosophyQuote);
    setText('#escuela .founder-name', site.founderName);
    setText('#escuela .founder-role', site.founderRole);
    setText('#escuela .founder-bio', site.founderBio);

    if (Array.isArray(site.storyParagraphs) && site.storyParagraphs.length > 0) {
      const storyBox = document.querySelector('#escuela .story-content');
      if (storyBox) {
        const eyebrow = escapeHtml(site.storyEyebrow || 'Nuestra Historia');
        const ps = site.storyParagraphs.map(p => String(p).trim()).filter(Boolean);
        let html = `<div class="story-eyebrow">${eyebrow}</div>`;
        ps.forEach((p, idx) => {
          if (idx === 0) {
            html += `<p class="story-lead">${escapeHtml(p)}</p>`;
          } else if (idx === ps.length - 1 && ps.length > 1) {
            html += `<div class="story-closing-highlight"><p>${escapeHtml(p)}</p></div>`;
          } else {
            html += `<p>${escapeHtml(p)}</p>`;
          }
        });
        storyBox.innerHTML = html;
      }
    }

    // 3. Contact info & Form Email
    setText('[data-cms="address"]', site.address);
    const phoneLink = document.querySelector('[data-cms="phone-link"]');
    if (phoneLink && site.phoneDisplay) {
      phoneLink.textContent = site.phoneDisplay;
      const digits = site.phoneDisplay.replace(/[^\d+]/g, '');
      if (digits) phoneLink.setAttribute('href', `tel:${digits}`);
    }
    const igLink = document.querySelector('[data-cms="instagram-link"]');
    if (igLink && site.instagramHandle) {
      igLink.textContent = site.instagramHandle;
      if (site.instagramUrl) igLink.setAttribute('href', safeUrl(site.instagramUrl, igLink.href));
    }
    if (site.whatsappNumber) {
      const cleanWa = String(site.whatsappNumber).replace(/\D/g, '');
      if (cleanWa) {
        document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
          a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${cleanWa}`);
        });
      }
    }
    if (site.formEmail && site.formEmail.includes('@')) {
      window.EA_FORM_EMAIL = site.formEmail.trim();
    }

    // 4. Testimonials
    if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
      const track = document.getElementById('testimonials-track');
      if (track) {
        track.innerHTML = data.testimonials.map(t => {
          const igUrl = safeUrl(t.instagramUrl, 'https://www.instagram.com/examenaprobado/');
          const imgSrc = safeUrl(t.image, 'images/logo.jpg');
          const pos = escapeHtml(t.objectPosition || 'center 30%');
          const name = escapeHtml(t.name || '');
          const degree = escapeHtml(t.degree || '');
          const badge = escapeHtml(t.badge || 'Examen de Grado Aprobado');
          const quote = escapeHtml(t.quote || '');
          return `
            <article class="testimonial-card">
              <a href="${escapeHtml(igUrl)}" target="_blank" rel="noopener noreferrer" class="testimonial-media-link" aria-label="Ver testimonio de ${name} en Instagram">
                <img src="${escapeHtml(imgSrc)}" alt="${name} celebrando su Examen de Grado Aprobado" width="480" height="360" style="object-position: ${pos};">
                <span class="testimonial-ig-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  <span>Ver en Instagram</span>
                </span>
              </a>
              <div class="testimonial-body">
                <div class="testimonial-meta-row">
                  <div class="stars-rating">★★★★★</div>
                  <span class="author-badge">${badge}</span>
                </div>
                <p class="testimonial-text">“${quote}”</p>
                <div class="testimonial-author">
                  <div class="author-info">
                    <h4>${name}</h4>
                    <p>${degree}</p>
                  </div>
                  <a href="${escapeHtml(igUrl)}" target="_blank" rel="noopener noreferrer" class="testimonial-ig-link">Ver post &rarr;</a>
                </div>
              </div>
            </article>`;
        }).join('');
      }
    }

    // 5. Gallery
    if (Array.isArray(data.gallery) && data.gallery.length > 0) {
      const galleryGrid = document.getElementById('gallery-grid');
      if (galleryGrid) {
        galleryGrid.innerHTML = data.gallery.map(g => {
          const imgSrc = safeUrl(g.image, 'images/logo.jpg');
          const tag = escapeHtml(g.tag || 'Examen Aprobado');
          const alt = escapeHtml(g.alt || g.tag || 'Momento en Examen Aprobado');
          const cls = g.cropClass ? ` class="${escapeHtml(g.cropClass)}"` : '';
          const posStyle = (!g.cropClass && g.objectPosition) ? ` style="object-position: ${escapeHtml(g.objectPosition)};"` : '';
          return `
            <div class="gallery-item">
              <img src="${escapeHtml(imgSrc)}" alt="${alt}"${cls}${posStyle} loading="eager" decoding="async">
              <div class="gallery-overlay">
                <span class="gallery-item-tag">${tag}</span>
              </div>
              <div class="gallery-zoom-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </div>
            </div>`;
        }).join('');
      }
    }
  } catch (err) {
    // Fallback silencioso al HTML estático si se abre por file://
  }
}

/* ==========================================================================
   1. STICKY HEADER OBSERVER
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. MOBILE MENU & ACCESSIBILITY
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const drawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  function toggleMenu(forceOpen) {
    const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.add('open');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  toggleBtn.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   3. ACTIVE NAVIGATION SPY (IntersectionObserver)
   ========================================================================== */
function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   4. GALLERY HORIZONTAL SLIDER (Desliza suavemente de a 9 fotos)
   ========================================================================== */
function initGalleryPagination() {
  const viewport = document.getElementById('gallery-viewport');
  const track = document.getElementById('gallery-grid');
  const galleryItems = Array.from(document.querySelectorAll('#gallery-grid > .gallery-item'));
  const prevBtns = [
    document.getElementById('gallery-prev-btn'),
    document.getElementById('gallery-side-prev')
  ].filter(Boolean);
  const nextBtns = [
    document.getElementById('gallery-next-btn'),
    document.getElementById('gallery-side-next')
  ].filter(Boolean);
  const dotsContainer = document.getElementById('gallery-dots');
  const rangeText = document.getElementById('gallery-range-text');

  if (!viewport || !track || !galleryItems.length) return;

  // Precargar imágenes de la galería para evitar parpadeos al deslizar
  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.decoding = 'async';
    }
  });

  // Agrupar las tarjetas en slides horizontales de 9 fotos por vista (3x3)
  const PAGE_SIZE = 9;
  const slides = [];
  const ranges = [];

  for (let cursor = 0; cursor < galleryItems.length; cursor += PAGE_SIZE) {
    const end = Math.min(cursor + PAGE_SIZE, galleryItems.length);
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';

    for (let i = cursor; i < end; i++) {
      slide.appendChild(galleryItems[i]);
    }

    track.appendChild(slide);
    slides.push(slide);
    ranges.push([cursor + 1, end]);
  }

  let currentPage = 0;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', `Ir a la página ${idx + 1} de la galería`);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function syncViewportHeight() {
    const activeSlide = slides[currentPage];
    if (activeSlide) {
      viewport.style.height = `${activeSlide.offsetHeight}px`;
    }
  }

  function goToSlide(pageIndex) {
    currentPage = (pageIndex + slides.length) % slides.length;
    track.style.transform = `translate3d(-${currentPage * 100}%, 0, 0)`;
    syncViewportHeight();

    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentPage);
      });
    }

    if (rangeText) {
      const [start, end] = ranges[currentPage];
      rangeText.textContent = `Mostrando ${start}–${end} de ${galleryItems.length} fotos`;
    }
  }

  prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(currentPage - 1);
  }));

  nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(currentPage + 1);
  }));

  // Soporte táctil para deslizar con el dedo en móvil
  let touchStartX = 0;
  let touchStartY = 0;
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToSlide(currentPage + 1);
      else goToSlide(currentPage - 1);
    }
  }, { passive: true });

  window.addEventListener('resize', syncViewportHeight);
  window.addEventListener('load', syncViewportHeight);

  // Inicializar sin transición de altura en el primer frame
  viewport.style.transition = 'none';
  goToSlide(0);
  requestAnimationFrame(() => {
    syncViewportHeight();
    requestAnimationFrame(() => {
      viewport.style.transition = '';
    });
  });
}

/* ==========================================================================
   4B. TESTIMONIALS HORIZONTAL SLIDER (3 por vista, 25 experiencias reales)
   ========================================================================== */
function initTestimonialsCarousel() {
  const viewport = document.getElementById('testimonials-viewport');
  const track = document.getElementById('testimonials-track');
  const cards = Array.from(document.querySelectorAll('#testimonials-track > .testimonial-card'));
  const prevBtns = [
    document.getElementById('testimonials-prev-btn'),
    document.getElementById('testimonials-side-prev')
  ].filter(Boolean);
  const nextBtns = [
    document.getElementById('testimonials-next-btn'),
    document.getElementById('testimonials-side-next')
  ].filter(Boolean);
  const dotsContainer = document.getElementById('testimonials-dots');
  const rangeText = document.getElementById('testimonials-range-text');

  if (!viewport || !track || !cards.length) return;

  cards.forEach(card => {
    const img = card.querySelector('img');
    if (img) {
      img.decoding = 'async';
    }
  });

  const PAGE_SIZE = 3;
  const slides = [];
  const ranges = [];

  for (let cursor = 0; cursor < cards.length; cursor += PAGE_SIZE) {
    const end = Math.min(cursor + PAGE_SIZE, cards.length);
    const slide = document.createElement('div');
    slide.className = 'testimonials-slide';

    for (let i = cursor; i < end; i++) {
      slide.appendChild(cards[i]);
    }

    track.appendChild(slide);
    slides.push(slide);
    ranges.push([cursor + 1, end]);
  }

  let currentPage = 0;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonials-dot';
      dot.setAttribute('aria-label', `Ir a la página ${idx + 1} de testimonios`);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function syncViewportHeight() {
    const activeSlide = slides[currentPage];
    if (activeSlide) {
      viewport.style.height = `${activeSlide.offsetHeight}px`;
    }
  }

  function goToSlide(pageIndex) {
    currentPage = (pageIndex + slides.length) % slides.length;
    track.style.transform = `translate3d(-${currentPage * 100}%, 0, 0)`;
    syncViewportHeight();

    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentPage);
      });
    }

    if (rangeText) {
      const [start, end] = ranges[currentPage];
      rangeText.textContent = `Mostrando ${start}–${end} de ${cards.length} experiencias`;
    }
  }

  prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(currentPage - 1);
  }));

  nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(currentPage + 1);
  }));

  // Soporte táctil para deslizar en móvil
  let touchStartX = 0;
  let touchStartY = 0;
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToSlide(currentPage + 1);
      else goToSlide(currentPage - 1);
    }
  }, { passive: true });

  window.addEventListener('resize', syncViewportHeight);
  window.addEventListener('load', syncViewportHeight);

  viewport.style.transition = 'none';
  goToSlide(0);
  requestAnimationFrame(() => {
    syncViewportHeight();
    requestAnimationFrame(() => {
      viewport.style.transition = '';
    });
  });
}

/* ==========================================================================
   5. LIGHTBOX MODAL (with Prev/Next Navigation across all gallery photos)
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const modalCounter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

  if (!modal || !modalImg) return;

  let currentIndex = 0;

  const showImageAt = (index) => {
    if (!galleryItems.length) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-item-tag')?.textContent || '';
    if (img) {
      modalImg.src = img.src;
      modalImg.alt = img.alt || title;
      if (modalCaption) modalCaption.textContent = title;
      if (modalCounter) modalCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    }
  };

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      showImageAt(idx);
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImageAt(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImageAt(currentIndex + 1); });

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-container')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showImageAt(currentIndex - 1);
    if (e.key === 'ArrowRight') showImageAt(currentIndex + 1);
  });
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other items
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      // Toggle current
      item.classList.toggle('active', !isActive);
    });
  });
}

/* ==========================================================================
   7. FORM SUBMISSIONS (Envío directo en segundo plano al correo oficial)
   ========================================================================== */
function initForms() {
  const targetEmail = (window.EA_FORM_EMAIL && window.EA_FORM_EMAIL.includes('@'))
    ? window.EA_FORM_EMAIL
    : 'examenaprobadocl@gmail.com';
  const TARGET_EMAIL_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`;

  // Quick Reservation / Cupo Form
  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    const submitBtn = document.getElementById('res-submit-btn');
    const feedbackEl = document.getElementById('reservation-feedback');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Protección anti-spam (honeypot)
      const honey = reservationForm.querySelector('input[name="_honey"]')?.value;
      if (honey) return;

      const name = document.getElementById('res-name')?.value.trim() || 'Estudiante';
      const email = document.getElementById('res-email')?.value.trim() || '';
      const phone = document.getElementById('res-phone')?.value.trim() || '';
      const program = document.getElementById('res-program')?.value || 'Tutoría o Interrogación';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando solicitud...</span>';
      }
      if (feedbackEl) {
        feedbackEl.hidden = true;
        feedbackEl.className = 'form-feedback';
      }

      try {
        const response = await fetch(TARGET_EMAIL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            Nombre: name,
            Correo: email,
            'Teléfono / WhatsApp': phone,
            'Programa de Interés': program,
            _subject: `Nueva Reserva de Cupo - ${name} | Examen Aprobado`,
            _replyto: email,
            _template: 'table',
            _captcha: 'false'
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === 'false') {
          throw new Error(data.message || 'No se pudo enviar el formulario');
        }

        reservationForm.reset();
        showToast(`¡Gracias ${name}! Tu solicitud fue enviada correctamente.`);
        if (feedbackEl) {
          feedbackEl.textContent = '✓ ¡Solicitud enviada con éxito! Recibimos tus datos y te responderemos en menos de 24 horas.';
          feedbackEl.classList.add('is-success');
          feedbackEl.hidden = false;
        }
      } catch (err) {
        console.error('Error al enviar formulario:', err);
        showToast('Hubo un problema al enviar. Intenta nuevamente o escríbenos por WhatsApp.');
        if (feedbackEl) {
          feedbackEl.innerHTML = 'No pudimos enviar el formulario en este momento. Intenta de nuevo o escríbenos directo por <a href="https://wa.me/56987188165" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: var(--color-gold-300);">WhatsApp</a>.';
          feedbackEl.classList.add('is-error');
          feedbackEl.hidden = false;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }
}

/* Toast helper */
function showToast(text) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <span class="toast-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </span>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toast);
  }

  const toastText = toast.querySelector('.toast-text');
  if (toastText) toastText.textContent = text;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   8. COOKIE CONSENT BANNER
   ========================================================================== */
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');

  if (!banner || !acceptBtn) return;

  const accepted = localStorage.getItem('ea_cookie_accepted');
  if (accepted === 'true') {
    banner.classList.add('hidden');
    return;
  }

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('ea_cookie_accepted', 'true');
    banner.classList.add('hidden');
  });
}
