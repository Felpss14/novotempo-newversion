const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 20));
menuButton?.addEventListener('click', () => {
  const open = menuButton.classList.toggle('open');
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton?.classList.remove('open'); nav.classList.remove('open'); document.body.classList.remove('menu-open');
}));

const carousel = document.querySelector('.carousel');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.slide')];
  const dots = carousel.querySelector('.carousel-dots');
  let index = 0;
  const go = (i) => { index = (i + slides.length) % slides.length; track.style.transform = `translateX(-${index * 100}%)`; [...dots.children].forEach((d,j)=>d.classList.toggle('active',j===index)); };
  slides.forEach((_,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label',`Ir para foto ${i+1}`); b.addEventListener('click',()=>go(i)); dots.appendChild(b); });
  carousel.querySelector('.prev')?.addEventListener('click',()=>go(index-1));
  carousel.querySelector('.next')?.addEventListener('click',()=>go(index+1));
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
  let heroTimer;
  let touchStartX = 0;

  const restartProgress = () => {
    if (!progress || reduceMotion) return;
    progress.classList.remove('running');
    void progress.offsetWidth;
    progress.classList.add('running');
  };

  const showHeroSlide = (nextIndex, restart = true) => {
    heroIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === heroIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    [...dotsWrap.children].forEach((dot, i) => dot.classList.toggle('active', i === heroIndex));
    if (restart) startHeroAutoplay();
  };

  const startHeroAutoplay = () => {
    clearInterval(heroTimer);
    restartProgress();
    if (!reduceMotion) heroTimer = setInterval(() => showHeroSlide(heroIndex + 1, false), 7000);
  };

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Mostrar destaque ${i + 1}`);
    dot.addEventListener('click', () => showHeroSlide(i));
    dotsWrap.appendChild(dot);
  });

  heroCarousel.querySelector('.hero-prev')?.addEventListener('click', () => showHeroSlide(heroIndex - 1));
  heroCarousel.querySelector('.hero-next')?.addEventListener('click', () => showHeroSlide(heroIndex + 1));
  heroCarousel.addEventListener('mouseenter', () => clearInterval(heroTimer));
  heroCarousel.addEventListener('mouseleave', startHeroAutoplay);
  heroCarousel.addEventListener('focusin', () => clearInterval(heroTimer));
  heroCarousel.addEventListener('focusout', startHeroAutoplay);
  heroCarousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  heroCarousel.addEventListener('touchend', e => {
    const distance = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showHeroSlide(heroIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  showHeroSlide(0);
}
