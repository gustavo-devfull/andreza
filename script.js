// ── NAV ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

// ── SCROLL REVEAL ──
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }});
}, {threshold: 0.1, rootMargin: '0px 0px -50px 0px'});
document.querySelectorAll('.reveal').forEach(r => revObs.observe(r));

// ── COUNTER ──
function animateCount(el, target, suffix) {
  const dur = 1200, startTime = performance.now();
  const tick = now => {
    const p = Math.min((now - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + (p >= 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const t = +e.target.dataset.target;
      animateCount(e.target, t, t === 2 ? '' : '+');
      statObs.unobserve(e.target);
    }
  });
}, {threshold: 0.5});
document.querySelectorAll('[data-target]').forEach(el => statObs.observe(el));

// ── CAROUSEL ──
const TOTAL = 5;
const DURATION = 6000; // ms per slide
let current = 0;
let progressStart = null;
let paused = false;
let rafId = null;

const track    = document.getElementById('carouselTrack');
const dots     = document.querySelectorAll('.cdot');
const bar      = document.getElementById('progressBar');
const carousel = document.getElementById('carousel');

function goTo(idx) {
  const prev = current;
  current = (idx + TOTAL) % TOTAL;
  track.style.transform = `translateX(-${current * 100}%)`;

  // dots
  dots.forEach((d, i) => d.classList.toggle('active', i === current));

  // entering animation
  const slides = document.querySelectorAll('.cslide');
  slides.forEach(s => s.classList.remove('entering'));
  slides[current].classList.add('entering');

  // zoom bg on new slide
  const bgs = slides[current].querySelectorAll('.cslide-bg');
  bgs.forEach(bg => { bg.classList.remove('zoomed'); void bg.offsetWidth; bg.classList.add('zoomed'); });

  // reset progress
  progressStart = performance.now();
  bar.style.width = '0%';
  bar.style.transition = 'none';
}

function tick(now) {
  if (!paused && progressStart !== null) {
    const elapsed = now - progressStart;
    const pct = Math.min(elapsed / DURATION * 100, 100);
    bar.style.width = pct + '%';
    if (elapsed >= DURATION) goTo(current + 1);
  }
  rafId = requestAnimationFrame(tick);
}

// Start
progressStart = performance.now();
rafId = requestAnimationFrame(tick);

// Arrows
document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));
document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));

// Dots
dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));

// Pause on hover
carousel.addEventListener('mouseenter', () => { paused = true; });
carousel.addEventListener('mouseleave', () => { paused = false; progressStart = performance.now() - (parseFloat(bar.style.width) / 100 * DURATION); });

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'ArrowLeft')  goTo(current - 1);
});

// ── LIGHTBOX ──
const galImgs = [...document.querySelectorAll('.gal-item img')];
const galSrcs = galImgs.map(img => img.src);
let lbIndex = 0;
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');

function lbOpen(i) {
  lbIndex = i;
  lbImg.src = galSrcs[i];
  lbCounter.textContent = (i + 1) + ' / ' + galSrcs.length;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function lbClose() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function lbGo(dir) {
  lbIndex = (lbIndex + dir + galSrcs.length) % galSrcs.length;
  lbImg.style.opacity = '0';
  setTimeout(() => { lbImg.src = galSrcs[lbIndex]; lbImg.style.opacity = '1'; }, 150);
  lbCounter.textContent = (lbIndex + 1) + ' / ' + galSrcs.length;
}

galImgs.forEach((img, i) => img.addEventListener('click', () => lbOpen(i)));
document.getElementById('lbClose').addEventListener('click', lbClose);
document.getElementById('lbPrev').addEventListener('click', () => lbGo(-1));
document.getElementById('lbNext').addEventListener('click', () => lbGo(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lbClose(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      lbClose();
  if (e.key === 'ArrowRight')  lbGo(1);
  if (e.key === 'ArrowLeft')   lbGo(-1);
});

// ── FORM ──
function handleForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = 'Mensagem enviada ✓';
  btn.style.background = 'var(--lime)';
  setTimeout(() => { btn.textContent = 'Enviar mensagem →'; btn.style.background = ''; e.target.reset(); }, 3000);
}
