/* =============================================================
   AirPods Pro — Scroll-Driven Animation
   Video: 200 frames @ 24fps, 8.33s
   Stages: 1s (frame 24), 4s (frame 96), 7s (frame 168)
   FRAME_SPEED=2.0 → video completes by 50% scroll progress
   ============================================================= */

'use strict';

// ── Config ──────────────────────────────────────────────────────
const FRAME_COUNT  = 200;
const FRAME_SPEED  = 2.0;   // 1.8-2.2: higher = product animation finishes earlier

// ── State ────────────────────────────────────────────────────────
const frames       = new Array(FRAME_COUNT).fill(null);
let loadedCount    = 0;
let bgColor        = '#b8c3ca';   // fallback; overwritten from frame[0] corner sample
let currentFrame   = 0;

// ── Elements ─────────────────────────────────────────────────────
const loaderEl      = document.getElementById('loader');
const loaderBar     = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const canvasWrap    = document.getElementById('canvas-wrap');
const canvas        = document.getElementById('canvas');
const ctx           = canvas.getContext('2d');
const hero          = document.getElementById('hero');
const scrollCont    = document.getElementById('scroll-container');
const darkOverlay   = document.getElementById('dark-overlay');
const marqueeEl     = document.getElementById('marquee');
const siteHeader    = document.getElementById('site-header');


// ═══════════════════════════════════════════════════════════════
// CANVAS — setup + drawing
// ═══════════════════════════════════════════════════════════════

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w   = window.innerWidth;
  const h   = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  drawFrame(currentFrame);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* Render the video frame into the RIGHT portion of the canvas.
   The left area is filled with bgColor (matching video bg),
   while the white gradient overlay in CSS handles the left-white effect. */
function drawFrame(idx) {
  const img = frames[idx];
  if (!img) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // RIGHT zone: starts at 43% from left, spans to right edge
  const zoneX = cw * 0.43;
  const zoneW = cw * 0.57;

  // Scale to fill zone, maintaining aspect ratio, with slight padding
  const scale = Math.min(zoneW / iw, ch / ih) * 0.93;
  const dw    = iw * scale;
  const dh    = ih * scale;
  const dx    = zoneX + (zoneW - dw) / 2;   // center within right zone
  const dy    = (ch  - dh) / 2;             // center vertically

  // Fill canvas background first (matches video bg color)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);

  ctx.drawImage(img, dx, dy, dw, dh);
}

/* Sample corner pixel of first frame to get the video background color */
function sampleBgColor(img) {
  try {
    const t  = document.createElement('canvas');
    t.width  = 4;
    t.height = 4;
    const tc = t.getContext('2d');
    tc.drawImage(img, 0, 0, 4, 4);
    const d  = tc.getImageData(0, 0, 1, 1).data;
    bgColor  = `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch (_) { /* cross-origin guard */ }
}


// ═══════════════════════════════════════════════════════════════
// FRAME PRELOADER — two-phase: first 12 fast, then rest
// ═══════════════════════════════════════════════════════════════

function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    const num = String(i + 1).padStart(4, '0');
    img.src   = `frames/frame_${num}.webp`;
    img.onload = () => {
      frames[i] = img;
      loadedCount++;
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      loaderBar.style.width     = pct + '%';
      loaderPercent.textContent = pct + '%';
      if (i === 0) { sampleBgColor(img); drawFrame(0); }
      resolve();
    };
    img.onerror = () => { loadedCount++; resolve(); };
  });
}

async function preloadFrames() {
  // Phase 1: first 12 frames for fast visual feedback
  await Promise.all(Array.from({ length: Math.min(12, FRAME_COUNT) }, (_, i) => loadFrame(i)));
  drawFrame(0);

  // Phase 2: load all remaining frames in parallel
  await Promise.all(
    Array.from({ length: FRAME_COUNT - 12 }, (_, i) => loadFrame(i + 12))
  );

  // All frames ready — reveal site
  loaderEl.classList.add('hidden');
  setTimeout(initScene, 650);
}


// ═══════════════════════════════════════════════════════════════
// INIT SCENE
// ═══════════════════════════════════════════════════════════════

function initScene() {
  siteHeader.classList.add('visible');
  initHeroEntrance();
  initLenis();
  gsap.registerPlugin(ScrollTrigger);
  initScrollSystem();
}


// ═══════════════════════════════════════════════════════════════
// HERO ENTRANCE ANIMATION
// ═══════════════════════════════════════════════════════════════

function initHeroEntrance() {
  const label     = hero.querySelector('.hero-label');
  const words     = hero.querySelectorAll('.hero-heading .word');
  const tagline   = hero.querySelector('.hero-tagline');
  const indicator = hero.querySelector('.scroll-indicator');

  const tl = gsap.timeline({ delay: 0.2 });
  tl.from(label,     { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .from(words,     { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.35')
    .from(tagline,   { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .from(indicator, { y: 14, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
}


// ═══════════════════════════════════════════════════════════════
// LENIS SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════════

function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}


// ═══════════════════════════════════════════════════════════════
// SCROLL SYSTEM — master ScrollTrigger drives everything
// ═══════════════════════════════════════════════════════════════

// Track section states: 'out' | 'in' | 'persisted'
const sectionTLs     = new Map();
const sectionStates  = new Map();

function initScrollSystem() {
  setupSections();
  setupCounters();
  setupMarquee();

  ScrollTrigger.create({
    trigger: scrollCont,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   true,
    onUpdate(self) {
      const p = self.progress;

      // 1. Frame playback (video animation)
      const acc = Math.min(p * FRAME_SPEED, 1);
      const idx = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
      if (idx !== currentFrame) {
        currentFrame = idx;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }

      // 2. Hero fade-out + canvas circle-wipe reveal
      hero.style.opacity        = Math.max(0, 1 - p * 18);
      const wipeP               = Math.min(1, Math.max(0, (p - 0.01) / 0.09));
      canvasWrap.style.clipPath = `circle(${wipeP * 82}% at 50% 50%)`;

      // 3. Dark overlay for stats section (55% – 65% scroll)
      updateDarkOverlay(p, 0.54, 0.66);

      // 4. Marquee visibility (52% – 68%)
      updateMarqueeOpacity(p, 0.52, 0.68);

      // 5. Content sections
      updateSections(p);
    },
  });
}


// ═══════════════════════════════════════════════════════════════
// DARK OVERLAY
// ═══════════════════════════════════════════════════════════════

function updateDarkOverlay(p, enter, leave) {
  const fade = 0.035;
  let opacity = 0;
  if      (p >= enter - fade && p < enter)  opacity = (p - (enter - fade)) / fade;
  else if (p >= enter        && p < leave)  opacity = 0.92;
  else if (p >= leave        && p <= leave + fade) opacity = 0.92 * (1 - (p - leave) / fade);
  darkOverlay.style.opacity = opacity;
}


// ═══════════════════════════════════════════════════════════════
// MARQUEE
// ═══════════════════════════════════════════════════════════════

function updateMarqueeOpacity(p, enter, leave) {
  const fade = 0.025;
  let opacity = 0;
  if      (p >= enter        && p <= enter + fade) opacity = (p - enter) / fade;
  else if (p > enter + fade  && p < leave - fade)  opacity = 1;
  else if (p >= leave - fade && p <= leave)         opacity = 1 - (p - (leave - fade)) / fade;
  marqueeEl.style.opacity = opacity;
}

function setupMarquee() {
  gsap.to(marqueeEl.querySelector('.marquee-text'), {
    xPercent: -22,
    ease: 'none',
    scrollTrigger: {
      trigger: scrollCont,
      start: 'top top',
      end:   'bottom bottom',
      scrub: true,
    },
  });
}


// ═══════════════════════════════════════════════════════════════
// SECTION ANIMATIONS
// ═══════════════════════════════════════════════════════════════

function setupSections() {
  document.querySelectorAll('.scroll-section').forEach((section) => {
    const type     = section.dataset.animation;
    const children = section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .section-note, .cta-button, .stat'
    );

    const tl = gsap.timeline({ paused: true });

    switch (type) {
      case 'slide-left':
        tl.from(children, {
          x: -55, opacity: 0,
          stagger: 0.13, duration: 0.85, ease: 'power3.out',
        });
        break;

      case 'scale-up':
        tl.from(children, {
          scale: 0.87, y: 15, opacity: 0,
          stagger: 0.12, duration: 1.0, ease: 'power2.out',
        });
        break;

      case 'clip-reveal':
        tl.from(children, {
          clipPath: 'inset(100% 0 0 0)',
          opacity: 0,
          stagger: 0.14, duration: 1.1, ease: 'power4.inOut',
        });
        break;

      case 'stagger-up':
        tl.from(children, {
          y: 45, opacity: 0,
          stagger: 0.14, duration: 0.85, ease: 'power3.out',
        });
        break;

      case 'fade-up':
        tl.from(children, {
          y: 35, opacity: 0,
          stagger: 0.12, duration: 0.9, ease: 'power3.out',
        });
        break;
    }

    sectionTLs.set(section, tl);
    sectionStates.set(section, 'out');
  });
}

/* Called each frame from the master ScrollTrigger onUpdate */
function updateSections(p) {
  document.querySelectorAll('.scroll-section').forEach((section) => {
    const enter   = parseFloat(section.dataset.enter)  / 100;
    const leave   = parseFloat(section.dataset.leave)  / 100;
    const persist = section.dataset.persist === 'true';
    const tl      = sectionTLs.get(section);
    const state   = sectionStates.get(section);

    const inRange    = p >= enter && p <= leave;
    const isPersisted = persist && p >= enter;

    if ((inRange || isPersisted) && state === 'out') {
      // Animate IN
      section.style.visibility = 'visible';
      section.classList.add('is-active');
      tl.play(0);
      sectionStates.set(section, persist ? 'persisted' : 'in');

    } else if (!inRange && !isPersisted && state !== 'out') {
      // Animate OUT
      tl.reverse();
      sectionStates.set(section, 'out');
      // Hide after reverse completes (~900ms)
      setTimeout(() => {
        if (sectionStates.get(section) === 'out') {
          section.style.visibility = 'hidden';
          section.classList.remove('is-active');
        }
      }, 950);
    }
  });
}


// ═══════════════════════════════════════════════════════════════
// COUNTER ANIMATIONS (stat numbers count up from 0)
// ═══════════════════════════════════════════════════════════════

function setupCounters() {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target  = parseFloat(el.dataset.value);
    const section = el.closest('.scroll-section');
    const enter   = parseFloat(section.dataset.enter) / 100;
    let   fired   = false;

    ScrollTrigger.create({
      trigger: scrollCont,
      start:   'top top',
      end:     'bottom bottom',
      onUpdate(self) {
        if (self.progress >= enter && !fired) {
          fired = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power1.out',
            onUpdate() {
              el.textContent = Math.round(obj.val);
            },
          });
        }
        // Reset if user scrolls back above enter point
        if (self.progress < enter - 0.02 && fired) {
          fired = false;
          el.textContent = '0';
        }
      },
    });
  });
}


// ═══════════════════════════════════════════════════════════════
// KICK OFF
// ═══════════════════════════════════════════════════════════════

preloadFrames();
