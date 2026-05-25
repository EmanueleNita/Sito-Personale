(function () {
  /* Tutte le pagine valide incluse le pagine di dettaglio */
  const validPages = [
    'home','umanistiche','scientifiche','civica','pcto','hobby','certificazioni',
    'det-italiano','det-storia','det-inglese','det-motorie','det-religione',
    'det-informatica','det-reti','det-matematica','det-tpsit','det-ai','det-gpoi'
  ];

  const navSelectPages = ['home','umanistiche','scientifiche','civica','pcto','hobby','certificazioni'];

  const navLinks      = document.querySelectorAll('[data-page]');
  const csWrapper     = document.getElementById('customSelectWrapper');
  const csTrigger     = document.getElementById('customSelectTrigger');
  const csMenu        = document.getElementById('customSelectMenu');
  const csLabel       = document.getElementById('customSelectLabel');
  const csItems       = csMenu ? csMenu.querySelectorAll('.custom-select-item') : [];
  let isAnimating     = false;

  /* ── Custom select helpers ── */
  function openCustomSelect() {
    csWrapper.classList.add('open');
    csTrigger.setAttribute('aria-expanded', 'true');
  }
  function closeCustomSelect() {
    csWrapper.classList.remove('open');
    csTrigger.setAttribute('aria-expanded', 'false');
  }
  function updateCustomSelect(pageId) {
    // Custom "Vai a..." select
    csItems.forEach(item => item.classList.remove('active'));
    const match = csMenu ? csMenu.querySelector(`.custom-select-item[data-value="${pageId}"]`) : null;
    if (match) {
      match.classList.add('active');
      csLabel.textContent = match.textContent.trim();
    } else {
      csLabel.textContent = 'Vai a...';
    }
    // Nav dropdown items
    document.querySelectorAll('.nav-dropdown-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === pageId);
    });
  }

  function switchPage(pageId, pushState = true) {
    if (isAnimating) return;

    const currentPage = document.querySelector('.page.active-page');
    const nextPage    = document.getElementById(pageId) || document.getElementById('home');

    if (currentPage === nextPage) return;

    isAnimating = true;

    /* Fade-out current */
    currentPage.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    currentPage.style.opacity    = '0';
    currentPage.style.transform  = 'translateY(8px)';

    setTimeout(() => {
      currentPage.classList.remove('active-page');
      currentPage.style.transition = '';
      currentPage.style.opacity    = '';
      currentPage.style.transform  = '';

      nextPage.style.opacity    = '0';
      nextPage.style.transform  = 'translateY(12px)';
      nextPage.style.transition = 'none';
      nextPage.classList.add('active-page');

      void nextPage.offsetHeight; /* reflow */

      nextPage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      nextPage.style.opacity    = '1';
      nextPage.style.transform  = 'translateY(0)';

      setTimeout(() => {
        nextPage.style.transition = '';
        nextPage.style.opacity    = '';
        nextPage.style.transform  = '';
        isAnimating = false;
      }, 320);
    }, 200);

    /* Aggiorna nav links */
    navLinks.forEach(link =>
      link.classList.toggle('active', link.getAttribute('data-page') === pageId)
    );

    /* Aggiorna custom select (solo pagine principali) */
    if (csWrapper) {
      updateCustomSelect(navSelectPages.includes(pageId) ? pageId : '');
    }

    /* Hash */
    if (pushState && window.location.hash !== `#${pageId}`) {
      history.pushState(null, null, `#${pageId}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Nav links (navbar) */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      if (pageId) switchPage(pageId);

      const navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse?.classList.contains('show')) {
        bootstrap.Collapse.getInstance(navbarCollapse)?.hide();
      }
    });
  });

  /* Pulsanti "Apri dettaglio" sulle card materie */
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-goto');
      if (target) switchPage(target);
    });
  });

  /* Custom select "Vai a..." */
  if (csTrigger) {
    csTrigger.addEventListener('click', e => {
      e.stopPropagation();
      csWrapper.classList.contains('open') ? closeCustomSelect() : openCustomSelect();
    });
  }
  csItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-value');
      if (pageId) switchPage(pageId);
      closeCustomSelect();
    });
  });
  document.addEventListener('click', e => {
    if (csWrapper && !csWrapper.contains(e.target)) closeCustomSelect();
  });

  /* ── Nav dropdowns (Materie / Altro) ── */
  const navDropWrappers = document.querySelectorAll('.nav-dropdown-wrapper');

  function closeAllNavDrops(except) {
    navDropWrappers.forEach(w => { if (w !== except) w.classList.remove('open'); });
  }

  navDropWrappers.forEach(wrapper => {
    const trigger = wrapper.querySelector('.nav-dropdown-trigger');
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllNavDrops(null);
      closeCustomSelect();
      if (!isOpen) wrapper.classList.add('open');
    });
  });

  document.querySelectorAll('.nav-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-page');
      if (pageId) switchPage(pageId);
      closeAllNavDrops(null);
      // Chiudi anche hamburger su mobile
      const navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse?.classList.contains('show')) {
        bootstrap.Collapse.getInstance(navbarCollapse)?.hide();
      }
    });
  });

  document.addEventListener('click', () => closeAllNavDrops(null));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCustomSelect(); closeAllNavDrops(null); }
  });

  /* Civica — indice rapido: scroll alla sezione */
  document.querySelectorAll('.civica-index-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById('civica-' + btn.getAttribute('data-civica'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Back/forward browser */
  window.addEventListener('popstate', () => {
    const hash   = window.location.hash.substring(1);
    const target = validPages.includes(hash) ? hash : 'home';
    switchPage(target, false);
  });

  /* Init */
  const initHash = window.location.hash.substring(1);
  const initPage = validPages.includes(initHash) ? initHash : 'home';
  switchPage(initPage, false);
})();