(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =============================
     MENU MOBILE
  ============================== */
  function setMenu(open) {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.toggle('open', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    body.classList.toggle('menu-open', open);
  }

  menuToggle?.addEventListener('click', () => {
    const open = !mainNav.classList.contains('open');
    setMenu(open);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });

  document.addEventListener('click', event => {
    if (!mainNav?.classList.contains('open')) return;
    if (mainNav.contains(event.target) || menuToggle?.contains(event.target)) return;
    setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1000) setMenu(false);
  });

  /* =============================
     CABEÇALHO AO ROLAR
  ============================== */
  function updateHeader() {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* =============================
     SCROLL SUAVE COM COMPENSAÇÃO
  ============================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

      window.scrollTo({
        top,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });

      history.replaceState(null, '', id);
    });
  });

  /* =============================
     LINK ATIVO NO MENU
  ============================== */
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: [0, 0.1, 0.25, 0.5]
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  /* =============================
     CARROSSEL
  ============================== */
  const carousel = document.querySelector('.carousel');

  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = [...carousel.querySelectorAll('.slide')];
    const prev = carousel.querySelector('.carousel-arrow.prev');
    const next = carousel.querySelector('.carousel-arrow.next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    let current = 0;
    let timer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let dragging = false;

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';

      slides.forEach((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Ir para a foto ${index + 1}`);
        button.addEventListener('click', () => {
          goTo(index);
          restartAutoplay();
        });
        dotsContainer.appendChild(button);
      });
    }

    function updateCarousel() {
      if (!track || !slides.length) return;

      track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

      slides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      [...(dotsContainer?.children ?? [])].forEach((dot, index) => {
        const active = index === current;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      updateCarousel();
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotion.matches || slides.length < 2 || document.hidden) return;
      timer = window.setInterval(() => goTo(current + 1), 5500);
    }

    function stopAutoplay() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    prev?.addEventListener('click', () => {
      goTo(current - 1);
      restartAutoplay();
    });

    next?.addEventListener('click', () => {
      goTo(current + 1);
      restartAutoplay();
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(current - 1);
        restartAutoplay();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(current + 1);
        restartAutoplay();
      }
    });

    carousel.addEventListener('touchstart', event => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      dragging = true;
      stopAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchend', event => {
      if (!dragging) return;
      dragging = false;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY)) {
        goTo(current + (deltaX < 0 ? 1 : -1));
      }

      startAutoplay();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    reducedMotion.addEventListener?.('change', startAutoplay);

    carousel.tabIndex = 0;
    createDots();
    updateCarousel();
    startAutoplay();
  }

  /* =============================
     ANIMAÇÕES AO ROLAR
  ============================== */
  const revealElements = document.querySelectorAll(
    '.section-heading, .program-card, .why-grid article, .testimonial-grid blockquote, .contact-grid > *, .trust-strip .container'
  );

  revealElements.forEach(element => element.classList.add('reveal'));

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('revealed'));
  }
})();
