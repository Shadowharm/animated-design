/* ========================================
   MINDEXA DESIGN — Main JS
   ======================================== */

// --- GSAP + Lenis Smooth Scroll ---
gsap.registerPlugin(ScrollTrigger);

let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

initLenis();

// --- Animated Background Canvas ---
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let orbs = [];
  let canvasW, canvasH;
  let mouseX = -9999, mouseY = -9999;
  const ORB_COUNT = window.innerWidth < 768 ? 40 : 80;
  const CONNECTION_DIST = 140;
  const MOUSE_RADIUS = 200;

  function resizeCanvas() {
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  class Orb {
    constructor() {
      this.x = Math.random() * canvasW;
      this.y = Math.random() * canvasH;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
      // Random purple-blue hue: 240 (blue) to 280 (purple)
      this.hue = 240 + Math.random() * 40;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvasW) this.vx *= -1;
      if (this.y < 0 || this.y > canvasH) this.vy *= -1;

      const dx = this.x - mouseX;
      const dy = this.y - (mouseY + window.scrollY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.015;
        this.vx += dx * force;
        this.vy += dy * force;
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < ORB_COUNT; i++) {
    orbs.push(new Orb());
  }

  function drawConnections() {
    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        const dx = orbs[i].x - orbs[j].x;
        const dy = orbs[i].y - orbs[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          const hue = (orbs[i].hue + orbs[j].hue) / 2;
          ctx.beginPath();
          ctx.moveTo(orbs[i].x, orbs[i].y);
          ctx.lineTo(orbs[j].x, orbs[j].y);
          ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvasW, canvasH);
    orbs.forEach((o) => {
      o.update();
      o.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();

// --- Custom Cursor ---
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0;
  let fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const hoverTargets = document.querySelectorAll('a, button, .case-card');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      follower.classList.add('cursor-follower--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      follower.classList.remove('cursor-follower--hover');
    });
  });
}

// --- Hero Orb Movement ---
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  gsap.to('.hero-orb--1', { x: x * 30, y: y * 20, duration: 1.5, ease: 'power2.out' });
  gsap.to('.hero-orb--2', { x: x * -20, y: y * -15, duration: 1.8, ease: 'power2.out' });
  gsap.to('.hero-orb--3', { x: x * 15, y: y * 10, duration: 2, ease: 'power2.out' });
});

// --- GSAP Animations ---

// Hero entrance
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
heroTl
  .fromTo('.hero-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
  .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, '-=0.4')
  .fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
  .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');

// Nav scroll behavior
const nav = document.querySelector('nav');
nav.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

ScrollTrigger.create({
  start: 'top -80',
  end: 99999,
  onUpdate: (self) => {
    if (self.direction === 1 && self.scroll() > 200) {
      nav.style.transform = 'translateY(-100%)';
    }
    if (self.direction === -1 || self.scroll() < 100) {
      nav.style.transform = 'translateY(0)';
    }
  },
});

// Nav fade in
gsap.from('nav', { opacity: 0, duration: 0.8, delay: 1.2 });

// Cases header
gsap.from('.case-header', {
  scrollTrigger: { trigger: '.case-header', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

// Case cards
document.querySelectorAll('.case-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 100%' },
    opacity: 0, y: 40, duration: 0.6, delay: i * 0.08,
  });
});

// Pricing section
gsap.from('.pricing-header', {
  scrollTrigger: { trigger: '.pricing-header', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

document.querySelectorAll('.pricing-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 105%' },
    opacity: 0, y: 40, duration: 0.6, delay: i * 0.08,
  });
});

// Why section
gsap.from('.why-header', {
  scrollTrigger: { trigger: '.why-header', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

document.querySelectorAll('.why-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 105%' },
    opacity: 0, y: 30, duration: 0.5, delay: i * 0.06,
  });
});

// Approach section
gsap.from('.approach-header', {
  scrollTrigger: { trigger: '.approach-header', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

document.querySelectorAll('.approach-step').forEach((step, i) => {
  gsap.from(step, {
    scrollTrigger: { trigger: step, start: 'top 105%' },
    opacity: 0, y: 20, duration: 0.5, delay: i * 0.07,
  });
});

// Design matters
gsap.from('.design-matters-content', {
  scrollTrigger: { trigger: '.design-matters-content', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

document.querySelectorAll('.design-stat').forEach((stat, i) => {
  gsap.from(stat, {
    scrollTrigger: { trigger: stat, start: 'top 105%' },
    opacity: 0, y: 20, scale: 0.97, duration: 0.5, delay: i * 0.08,
  });
});

// Team
gsap.from('.team-content', {
  scrollTrigger: { trigger: '.team-content', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

// CTA
gsap.from('.cta-content', {
  scrollTrigger: { trigger: '.cta-content', start: 'top 100%' },
  opacity: 0, y: 30, duration: 0.6,
});

// --- Copy buttons ---
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    // show checkmark
    const copyIcon = btn.querySelector('.copy-icon');
    const checkIcon = btn.querySelector('.check-icon');
    copyIcon.classList.add('hidden');
    checkIcon.classList.remove('hidden');
    setTimeout(() => {
      copyIcon.classList.remove('hidden');
      checkIcon.classList.add('hidden');
    }, 1800);
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) lenis.scrollTo(target, { offset: -80 });
  });
});


function collectData() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,

    screenWidth: screen.width,
    screenHeight: screen.height,

    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    url: window.location.href,
    referrer: document.referrer,
  };
}

async function sendTracking() {
  try {
    await fetch('https://mindexa-design.ru/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectData()),
    });
  } catch (e) {
    console.error('Tracking failed', e);
  }
}

// вызывать при загрузке
sendTracking();

