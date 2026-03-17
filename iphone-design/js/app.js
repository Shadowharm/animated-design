/* ===== CONFIG ===== */
const FRAME_COUNT = 151;
const FRAME_SPEED = 2.0;
const IMAGE_SCALE = 0.88;
const FRAME_PATH = (i) => `frames/frame_${String(i).padStart(4, "0")}.webp`;

/* ===== STATE ===== */
let frames = [];
let currentFrame = 0;
let canvasBgColor = "#f5f5f7";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scrollContainer = document.getElementById("scroll-container");
const canvasWrap = document.getElementById("canvas-wrap");
const heroSection = document.getElementById("hero");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");
const header = document.querySelector(".site-header");
const darkOverlay = document.getElementById("dark-overlay");
const sections = document.querySelectorAll(".scroll-section");

/* ===== CANVAS SIZING ===== */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  drawFrame(currentFrame);
}

/* ===== BACKGROUND COLOR SAMPLING ===== */
function sampleBgColor(img) {
  const sCanvas = document.createElement("canvas");
  const sCtx = sCanvas.getContext("2d");
  sCanvas.width = img.naturalWidth;
  sCanvas.height = img.naturalHeight;
  sCtx.drawImage(img, 0, 0);

  // Sample corners
  const samples = [
    sCtx.getImageData(5, 5, 1, 1).data,
    sCtx.getImageData(img.naturalWidth - 5, 5, 1, 1).data,
    sCtx.getImageData(5, img.naturalHeight - 5, 1, 1).data,
    sCtx.getImageData(img.naturalWidth - 5, img.naturalHeight - 5, 1, 1).data,
  ];

  let r = 0, g = 0, b = 0;
  samples.forEach((s) => { r += s[0]; g += s[1]; b += s[2]; });
  r = Math.round(r / 4);
  g = Math.round(g / 4);
  b = Math.round(b / 4);

  return `rgb(${r},${g},${b})`;
}

/* ===== DRAW FRAME ===== */
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cw = rect.width;
  const ch = rect.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // Use contain mode to show the full phone, then center it in the right portion
  const scale = Math.min(cw / iw, ch / ih) * 0.92;
  const dw = iw * scale;
  const dh = ih * scale;
  // Shift phone slightly right within the canvas for better composition with left text
  const dx = (cw - dw) / 2 + cw * 0.05;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = canvasBgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);

  // CSS mask-image handles left-edge blending — no canvas feathering needed
}

/* ===== FRAME LOADER ===== */
function loadFrames() {
  return new Promise((resolve) => {
    let loaded = 0;

    // Phase 1: Load first 10 for fast first paint
    const firstBatch = 10;
    let firstBatchDone = false;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        frames[i - 1] = img;
        loaded++;

        // Sample bg color from first frame and sync everything
        if (loaded === 1) {
          const sampled = sampleBgColor(img);
          canvasBgColor = sampled;
          // Force the entire page background to match the video edges exactly
          document.body.style.background = sampled;
          document.querySelector('.hero-standalone').style.background = sampled;
          // Update CSS variable too
          document.documentElement.style.setProperty("--bg", sampled);
        }

        const pct = Math.round((loaded / FRAME_COUNT) * 100);
        loaderBar.style.width = pct + "%";
        loaderPercent.textContent = pct + "%";

        if (loaded === FRAME_COUNT) {
          resolve();
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === FRAME_COUNT) resolve();
      };
    }
  });
}

/* ===== HERO ENTRANCE ANIMATION ===== */
function animateHeroEntrance() {
  const words = document.querySelectorAll(".hero-heading .word");
  const tagline = document.querySelector(".hero-tagline");
  const label = document.querySelector(".hero-standalone .section-label");
  const indicator = document.querySelector(".scroll-indicator");

  gsap.set(label, { opacity: 0, y: 20 });

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to(label, {
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out"
  })
  .to(words, {
    opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: "power3.out"
  }, "-=0.3")
  .to(tagline, {
    opacity: 1, y: 0, duration: 0.8, ease: "power3.out"
  }, "-=0.4")
  .to(indicator, {
    opacity: 1, duration: 0.6, ease: "power2.out"
  }, "-=0.3");
}

/* ===== SCROLL SETUP ===== */
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Main scroll trigger — drives everything
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Frame playback
      const accelerated = Math.min(p * FRAME_SPEED, 1);
      const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
      if (index !== currentFrame) {
        currentFrame = index;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }

      // Hero fade-out
      heroSection.style.opacity = Math.max(0, 1 - p * 12);
      if (p > 0.08) {
        heroSection.style.visibility = "hidden";
      } else {
        heroSection.style.visibility = "visible";
      }

      // Canvas circle-wipe reveal
      const wipeProgress = Math.min(1, Math.max(0, (p - 0.005) / 0.06));
      const radius = wipeProgress * 80;
      canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;
      canvasWrap.style.opacity = wipeProgress > 0 ? 1 : 0;

      // Header show/hide
      if (p > 0.05) {
        header.classList.add("visible");
      } else {
        header.classList.remove("visible");
      }

      // Section visibility
      updateSections(p);

      // Dark overlay for stats
      updateDarkOverlay(p);

      // Marquee opacity
      updateMarquee(p);
    },
  });

  // Setup section animations
  sections.forEach(setupSectionAnimation);

  // Counter animations
  initCounters();

  // Marquee scroll
  initMarquee();
}

/* ===== SECTION VISIBILITY ===== */
function updateSections(progress) {
  sections.forEach((section) => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const persist = section.dataset.persist === "true";
    const fadeRange = 0.025;

    let opacity = 0;

    if (progress >= enter - fadeRange && progress < enter) {
      opacity = (progress - (enter - fadeRange)) / fadeRange;
    } else if (progress >= enter && progress <= leave) {
      opacity = 1;
    } else if (!persist && progress > leave && progress < leave + fadeRange) {
      opacity = 1 - (progress - leave) / fadeRange;
    } else if (persist && progress > leave) {
      opacity = 1;
    }

    if (opacity > 0.01) {
      section.classList.add("active");
      section.style.opacity = Math.min(1, opacity);
    } else {
      section.classList.remove("active");
      section.style.opacity = 0;
    }
  });
}

/* ===== SECTION ANIMATIONS ===== */
function setupSectionAnimation(section) {
  const type = section.dataset.animation;
  const children = section.querySelectorAll(
    ".section-label, .section-heading, .section-body, .section-note, .cta-button, .stat"
  );

  if (!children.length) return;

  // Set initial state based on animation type
  switch (type) {
    case "fade-up":
      gsap.set(children, { y: 50, opacity: 0 });
      break;
    case "slide-left":
      gsap.set(children, { x: -80, opacity: 0 });
      break;
    case "slide-right":
      gsap.set(children, { x: 80, opacity: 0 });
      break;
    case "scale-up":
      gsap.set(children, { scale: 0.85, opacity: 0 });
      break;
    case "rotate-in":
      gsap.set(children, { y: 40, rotation: 3, opacity: 0 });
      break;
    case "stagger-up":
      gsap.set(children, { y: 60, opacity: 0 });
      break;
    case "clip-reveal":
      gsap.set(children, { clipPath: "inset(100% 0 0 0)", opacity: 0 });
      break;
  }

  // Observer for when section becomes active
  const observer = new MutationObserver(() => {
    if (section.classList.contains("active")) {
      animateIn(children, type);
    } else {
      resetAnimation(children, type);
    }
  });

  observer.observe(section, { attributes: true, attributeFilter: ["class"] });
}

function animateIn(children, type) {
  switch (type) {
    case "fade-up":
      gsap.to(children, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out" });
      break;
    case "slide-left":
      gsap.to(children, { x: 0, opacity: 1, stagger: 0.14, duration: 0.9, ease: "power3.out" });
      break;
    case "slide-right":
      gsap.to(children, { x: 0, opacity: 1, stagger: 0.14, duration: 0.9, ease: "power3.out" });
      break;
    case "scale-up":
      gsap.to(children, { scale: 1, opacity: 1, stagger: 0.12, duration: 1.0, ease: "power2.out" });
      break;
    case "rotate-in":
      gsap.to(children, { y: 0, rotation: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power3.out" });
      break;
    case "stagger-up":
      gsap.to(children, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "power3.out" });
      break;
    case "clip-reveal":
      gsap.to(children, { clipPath: "inset(0% 0 0 0)", opacity: 1, stagger: 0.15, duration: 1.2, ease: "power4.inOut" });
      break;
  }
}

function resetAnimation(children, type) {
  switch (type) {
    case "fade-up":
      gsap.set(children, { y: 50, opacity: 0 });
      break;
    case "slide-left":
      gsap.set(children, { x: -80, opacity: 0 });
      break;
    case "slide-right":
      gsap.set(children, { x: 80, opacity: 0 });
      break;
    case "scale-up":
      gsap.set(children, { scale: 0.85, opacity: 0 });
      break;
    case "rotate-in":
      gsap.set(children, { y: 40, rotation: 3, opacity: 0 });
      break;
    case "stagger-up":
      gsap.set(children, { y: 60, opacity: 0 });
      break;
    case "clip-reveal":
      gsap.set(children, { clipPath: "inset(100% 0 0 0)", opacity: 0 });
      break;
  }
}

/* ===== DARK OVERLAY ===== */
function updateDarkOverlay(progress) {
  // Stats section: data-enter="60" data-leave="73"
  const enter = 0.58;
  const leave = 0.75;
  const fadeRange = 0.04;

  let opacity = 0;
  if (progress >= enter - fadeRange && progress < enter) {
    opacity = ((progress - (enter - fadeRange)) / fadeRange) * 0.92;
  } else if (progress >= enter && progress <= leave) {
    opacity = 0.92;
  } else if (progress > leave && progress < leave + fadeRange) {
    opacity = 0.92 * (1 - (progress - leave) / fadeRange);
  }

  darkOverlay.style.opacity = opacity;
}

/* ===== MARQUEE ===== */
function initMarquee() {
  const marqueeEl = document.getElementById("marquee-1");
  if (!marqueeEl) return;

  const text = marqueeEl.querySelector(".marquee-text");
  const speed = parseFloat(marqueeEl.dataset.scrollSpeed) || -20;

  gsap.to(text, {
    xPercent: speed,
    ease: "none",
    scrollTrigger: {
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });
}

function updateMarquee(progress) {
  const marqueeEl = document.getElementById("marquee-1");
  if (!marqueeEl) return;

  // Show marquee between 15% and 55% scroll (content sections, not during stats)
  let opacity = 0;
  if (progress > 0.10 && progress < 0.55) {
    if (progress < 0.15) opacity = (progress - 0.10) / 0.05;
    else if (progress > 0.50) opacity = (0.55 - progress) / 0.05;
    else opacity = 1;
  }

  marqueeEl.style.opacity = opacity;
}

/* ===== COUNTERS ===== */
function initCounters() {
  const counters = document.querySelectorAll(".stat-number");
  let animated = false;

  // Watch the stats section for active class
  const statsSection = document.querySelector(".section-stats");
  if (!statsSection) return;

  const observer = new MutationObserver(() => {
    if (statsSection.classList.contains("active") && !animated) {
      animated = true;
      counters.forEach((el) => {
        const target = parseFloat(el.dataset.value);
        const decimals = parseInt(el.dataset.decimals || "0");
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power1.out",
          onUpdate: () => {
            el.textContent = obj.val.toFixed(decimals);
          },
        });
      });
    } else if (!statsSection.classList.contains("active")) {
      animated = false;
      counters.forEach((el) => {
        el.textContent = "0";
      });
    }
  });

  observer.observe(statsSection, { attributes: true, attributeFilter: ["class"] });
}

/* ===== INIT ===== */
async function init() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  await loadFrames();

  // Hide loader
  loader.classList.add("hidden");

  // Draw first frame
  drawFrame(0);

  // Animate hero entrance
  animateHeroEntrance();

  // Setup all scroll-driven animations
  initScrollAnimations();
}

init();
