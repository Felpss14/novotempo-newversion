const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

const closeMenu = () => {
  menuButton?.classList.remove('open');
  nav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
};

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = !menuButton.classList.contains('open');
  menuButton.classList.toggle('open', open);
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1000) closeMenu();
});

// Galeria de eventos
const carousel = document.querySelector('.carousel');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.slide')];
  const dots = carousel.querySelector('.carousel-dots');
  let index = 0;
  let touchStartX = 0;

  const go = i => {
    if (!track || !slides.length) return;
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots?.querySelectorAll('button').forEach((dot, j) => {
      dot.classList.toggle('active', j === index);
      dot.setAttribute('aria-current', j === index ? 'true' : 'false');
    });
  };

  if (dots) {
    slides.forEach((_, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Ir para foto ${i + 1}`);
      button.addEventListener('click', () => go(i));
      dots.appendChild(button);
    });
  }

  carousel.querySelector('.prev')?.addEventListener('click', () => go(index - 1));
  carousel.querySelector('.next')?.addEventListener('click', () => go(index + 1));
  carousel.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) go(index + (distance < 0 ? 1 : -1));
  }, { passive: true });

  go(0);
}

// Carrossel principal do Hero
const heroCarousel = document.querySelector('.hero-carousel');
if (heroCarousel) {
  const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
  const dotsWrap = heroCarousel.querySelector('.hero-dots');
  const progress = heroCarousel.querySelector('.hero-progress span');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroIndex = 0;
  let heroTimer = null;
  let touchStartX = 0;
  let paused = false;

  const restartProgress = () => {
    if (!progress || reduceMotion) return;
    progress.classList.remove('running');
    void progress.offsetWidth;
    progress.classList.add('running');
  };

  const stopHeroAutoplay = () => {
    if (heroTimer) window.clearTimeout(heroTimer);
    heroTimer = null;
    progress?.classList.remove('running');
  };

  const scheduleNext = () => {
    stopHeroAutoplay();
    if (reduceMotion || paused || slides.length < 2) return;
    restartProgress();
    heroTimer = window.setTimeout(() => showHeroSlide(heroIndex + 1), 7000);
  };

  const showHeroSlide = nextIndex => {
    if (!slides.length) return;
    heroIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === heroIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dotsWrap?.querySelectorAll('button').forEach((dot, i) => {
      dot.classList.toggle('active', i === heroIndex);
      dot.setAttribute('aria-current', i === heroIndex ? 'true' : 'false');
    });
    scheduleNext();
  };

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Mostrar destaque ${i + 1}`);
      dot.addEventListener('click', () => showHeroSlide(i));
      dotsWrap.appendChild(dot);
    });
  }

  heroCarousel.querySelector('.hero-prev')?.addEventListener('click', () => showHeroSlide(heroIndex - 1));
  heroCarousel.querySelector('.hero-next')?.addEventListener('click', () => showHeroSlide(heroIndex + 1));

  const pause = () => {
    paused = true;
    stopHeroAutoplay();
  };
  const resume = () => {
    paused = false;
    scheduleNext();
  };

  heroCarousel.addEventListener('mouseenter', pause);
  heroCarousel.addEventListener('mouseleave', resume);
  heroCarousel.addEventListener('focusin', pause);
  heroCarousel.addEventListener('focusout', event => {
    if (!heroCarousel.contains(event.relatedTarget)) resume();
  });
  heroCarousel.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  heroCarousel.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showHeroSlide(heroIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else resume();
  });

  showHeroSlide(0);
}
