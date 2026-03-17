/* ═══════════════════════════════════════════
   ФОРМА — Animations & Interactions
   GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════ */

;(function () {
  'use strict'

  gsap.registerPlugin(ScrollTrigger)

  /* ── Loader ───────────────────────────── */
  const loader = document.getElementById('loader')
  const loaderProgress = document.getElementById('loaderProgress')
  const loaderPercent = document.getElementById('loaderPercent')

  let loadProgress = 0
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 25 + 5
    if (loadProgress >= 100) {
      loadProgress = 100
      clearInterval(loadInterval)
      setTimeout(finishLoading, 400)
    }
    loaderProgress.style.width = loadProgress + '%'
    loaderPercent.textContent = Math.round(loadProgress) + '%'
  }, 200)

  function finishLoading() {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.classList.add('is-done')
        loader.style.display = 'none'
        initAll()
      }
    })
  }

  /* ── Init Everything ──────────────────── */
  function initAll() {
    initLenis()
    initHero()
    initHeader()
    initMarquee()
    initStats()
    initScrollAnimations()
    initGallery()
    initMagneticButtons()
  }

  /* ── Lenis Smooth Scroll ──────────────── */
  let lenis

  function initLenis() {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
  }

  /* ── Header Scroll ────────────────────── */
  function initHeader() {
    const header = document.getElementById('header')

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 200) {
          header.classList.add('is-scrolled')
        }
        if (self.scroll() < 100) {
          header.classList.remove('is-scrolled')
        }
      }
    })
  }

  /* ── Hero Animations ──────────────────── */
  function initHero() {
    const tl = gsap.timeline({ delay: 0.2 })

    // Parallax on hero background
    gsap.to('.hero__bg-img', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    })

    // Stagger hero words
    tl.to('.hero__word', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power4.out'
    })
      .to('.hero__label', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.6')
      .to('.hero__subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.4')
      .to('.hero__actions', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.5')
      .to('.hero__scroll', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3')

    // Set initial states for elements that animate with y
    gsap.set('.hero__subtitle', { y: 30 })
    gsap.set('.hero__actions', { y: 30 })
  }

  /* ── Marquee ──────────────────────────── */
  function initMarquee() {
    // Speed up marquee on scroll
    gsap.to('.marquee__track', {
      x: '-=200',
      ease: 'none',
      scrollTrigger: {
        trigger: '.marquee',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    })
  }

  /* ── Stats Counter ────────────────────── */
  function initStats() {
    const statsGrid = document.querySelector('.stats__grid')
    const statItems = document.querySelectorAll('.stats__item')
    const statNumbers = document.querySelectorAll('.stats__number')

    // Set initial hidden state
    gsap.set(statItems, { y: 30, opacity: 0 })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return

        // Reveal items
        gsap.to(statItems, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out'
        })

        // Count up numbers
        statNumbers.forEach((el) => {
          const target = parseInt(el.dataset.count)
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = formatNumber(Math.round(obj.val))
            }
          })
        })

        observer.unobserve(entry.target)
      })
    }, { threshold: 0.2 })

    if (statsGrid) observer.observe(statsGrid)
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  /* ── Scroll Animations (IntersectionObserver + GSAP) ── */
  function initScrollAnimations() {
    // Use IntersectionObserver for reliable reveal with Lenis
    const revealSections = [
      {
        trigger: '.benefits__header',
        children: ['.benefits__header .section-label', '.benefits__header .section-title'],
        stagger: 0.12,
        animation: { y: 30, opacity: 0 }
      },
      {
        trigger: '.benefits__grid',
        children: '.benefits__card',
        stagger: 0.12,
        animation: { y: 50, opacity: 0 }
      },
      {
        trigger: '.trainers__header',
        children: ['.trainers__header .section-label', '.trainers__header .section-title', '.trainers__header .section-desc'],
        stagger: 0.1,
        animation: { y: 25, opacity: 0 }
      },
      {
        trigger: '.trainers__grid',
        children: '.trainers__card',
        stagger: 0.08,
        animation: { y: 40, opacity: 0 }
      },
      {
        trigger: '.pricing__header',
        children: ['.pricing__header .section-label', '.pricing__header .section-title'],
        stagger: 0.12,
        animation: { y: 30, opacity: 0 }
      },
      {
        trigger: '.pricing__grid',
        children: '.pricing__card',
        stagger: 0.1,
        animation: { scale: 0.92, opacity: 0 }
      },
      {
        trigger: '.cta__content',
        children: '.cta__content',
        stagger: 0,
        animation: { y: 40, opacity: 0 }
      }
    ]

    // Set initial hidden states
    revealSections.forEach(({ children, animation }) => {
      const els = typeof children === 'string'
        ? document.querySelectorAll(children)
        : children.flatMap(s => [...document.querySelectorAll(s)])
      els.forEach(el => gsap.set(el, animation))
    })

    // Create observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return

        const cfg = revealSections.find(s => entry.target.matches(s.trigger))
        if (!cfg) return

        const els = typeof cfg.children === 'string'
          ? document.querySelectorAll(cfg.children)
          : cfg.children.flatMap(s => [...document.querySelectorAll(s)])

        gsap.to(els, {
          y: 0,
          x: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: cfg.stagger,
          ease: 'power3.out',
          clearProps: 'transform'
        })

        observer.unobserve(entry.target)
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' })

    revealSections.forEach(({ trigger }) => {
      const el = document.querySelector(trigger)
      if (el) observer.observe(el)
    })

    // CTA parallax
    gsap.to('.cta__bg-img', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  /* ── Gallery Horizontal Scroll ────────── */
  function initGallery() {
    const track = document.querySelector('.gallery__track')
    const items = track.querySelectorAll('.gallery__item')
    const totalWidth = Array.from(items).reduce((acc, el) => acc + el.offsetWidth + 12, 0)

    gsap.to(track, {
      x: -(totalWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '.gallery',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    })
  }


  /* ── Magnetic Buttons ─────────────────── */
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.magnetic-btn')

    btns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out'
        })
      })

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        })
      })
    })
  }
})()
