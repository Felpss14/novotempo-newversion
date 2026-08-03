document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = !mainNav.classList.contains('open');
    mainNav.classList.toggle('open', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });

  mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }));

  function setupCarousel(root, options) {
    const track = root.querySelector(options.track);
    const slides = [...root.querySelectorAll(options.slide)];
    const prev = root.querySelector(options.prev);
    const next = root.querySelector(options.next);
    const dotsWrap = root.querySelector(options.dots);
    if (!track || slides.length < 2) return;

    let index = 0;
    let startX = 0;
    let timer;
    let dots = [...dotsWrap.querySelectorAll('button')];

    if (!dots.length && dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ver item ${i + 1}`);
        dotsWrap.appendChild(dot);
      });
      dots = [...dotsWrap.querySelectorAll('button')];
    }

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    };

    const go = value => {
      index = (value + slides.length) % slides.length;
      render();
    };

    prev?.addEventListener('click', () => go(index - 1));
    next?.addEventListener('click', () => go(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));

    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') go(index - 1);
      if (event.key === 'ArrowRight') go(index + 1);
    });

    root.addEventListener('pointerdown', event => { startX = event.clientX; });
    root.addEventListener('pointerup', event => {
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 45) go(index + (distance < 0 ? 1 : -1));
    });

    if (options.autoplay) {
      const start = () => { timer = window.setInterval(() => go(index + 1), options.autoplay); };
      const stop = () => window.clearInterval(timer);
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('focusin', stop);
      root.addEventListener('focusout', start);
      start();
    }

    render();
  }

  const gallery = document.querySelector('.carousel');
  if (gallery) setupCarousel(gallery, {
    track: '.carousel-track', slide: '.slide', prev: '.prev', next: '.next',
    dots: '.carousel-dots', autoplay: 6500
  });

  const hero = document.querySelector('.hero-carousel');
  if (hero) setupCarousel(hero, {
    track: '.hero-track', slide: '.hero-slide', prev: '.hero-prev', next: '.hero-next',
    dots: '.hero-dots', autoplay: 7000
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  document.querySelectorAll('.event-card, .service-group, .why-grid article, .testimonial-grid blockquote')
    .forEach(element => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
});
