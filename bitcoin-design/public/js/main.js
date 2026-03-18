    (() => {
        'use strict';

        /* ─── CUSTOM CURSOR ─── */
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (!isTouchDevice) {
            document.addEventListener('mousemove', e => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                dot.style.left = mouseX + 'px';
                dot.style.top = mouseY + 'px';
            });

            function animateRing() {
                ringX += (mouseX - ringX) * 0.15;
                ringY += (mouseY - ringY) * 0.15;
                ring.style.left = ringX + 'px';
                ring.style.top = ringY + 'px';
                requestAnimationFrame(animateRing);
            }
            animateRing();

            document.querySelectorAll('[data-cursor-hover]').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            });
        }

        /* ─── PARTICLE BACKGROUND ─── */
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let canvasW, canvasH;
        const PARTICLE_COUNT = window.innerWidth < 768 ? 55 : 110;
        const CONNECTION_DIST = 160;
        const MOUSE_RADIUS = 220;

        function resizeCanvas() {
            canvasW = canvas.width = window.innerWidth;
            canvasH = canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvasW;
                this.y = Math.random() * canvasH;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2 + 0.6;
                this.alpha = Math.random() * 0.7 + 0.25;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvasW) this.vx *= -1;
                if (this.y < 0 || this.y > canvasH) this.vy *= -1;

                // Mouse interaction
                const dx = this.x - mouseX;
                const dy = this.y - (mouseY + window.scrollY);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
                    this.vx += dx * force;
                    this.vy += dy * force;
                }

                // Damping
                this.vx *= 0.99;
                this.vy *= 0.99;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 220, 130, ${this.alpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.28;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 220, 130, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvasW, canvasH);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        /* ─── HEADER SCROLL ─── */
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });

        /* ─── MOBILE MENU ─── */
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.getElementById('nav');
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            menuToggle.classList.toggle('open');
        });

        /* ─── GSAP SCROLL ANIMATIONS ─── */
        gsap.registerPlugin(ScrollTrigger);

        // Reveal animations
        gsap.utils.toArray('.reveal').forEach((el, i) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                delay: (i % 4) * 0.08,
            });
        });

        gsap.utils.toArray('.reveal-left').forEach(el => {
            gsap.to(el, {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                },
            });
        });

        gsap.utils.toArray('.reveal-right').forEach(el => {
            gsap.to(el, {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                },
            });
        });

        gsap.utils.toArray('.reveal-scale').forEach(el => {
            gsap.to(el, {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                },
            });
        });

        // Stats counter animation
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const isDecimal = target % 1 !== 0;

            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to({ val: 0 }, {
                        val: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function() {
                            const v = this.targets()[0].val;
                            const formatted = isDecimal ? v.toFixed(2) : Math.round(v);
                            el.innerHTML = formatted + `<span class="stat-suffix">${suffix}</span>`;
                        }
                    });
                },
                once: true,
            });
        });

        /* ─── CRYPTO API ─── */
        const COIN_CONFIG = {
            bitcoin:  { id: 1,    ticker: 'btc', basePrice: 65000 },
            ethereum: { id: 1027, ticker: 'eth', basePrice: 3400  },
            solana:   { id: 5426, ticker: 'sol', basePrice: 160   },
            cardano:  { id: 2010, ticker: 'ada', basePrice: 0.60  },
        };

        // Интервал и форматирование подписи для каждого периода
        const PERIOD_CONFIG = {
            1:  { interval: '1h',  fmt: d => new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) },
            7:  { interval: '4h',  fmt: d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) },
            30: { interval: '1d',  fmt: d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) },
            90: { interval: '1d',  fmt: d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) },
        };

        let currentCoin = 'bitcoin';
        let currentDays = 7;
        let chartInstance = null;

        // Фоллбэк если API недоступен
        const fallbackPrices = {
            btc: { price: 67432.50, change24h:  2.34 },
            eth: { price:  3521.80, change24h: -0.87 },
            sol: { price:   178.45, change24h:  5.12 },
            ada: { price:     0.628, change24h:  1.45 },
        };

        function formatPrice(price) {
            if (price >= 1000) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (price >= 1)    return '$' + price.toFixed(2);
            return '$' + price.toFixed(4);
        }

        async function fetchPrices() {
            try {
                const res = await fetch('/api/prices');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                const mapped = {};
                Object.values(COIN_CONFIG).forEach(({ id, ticker }) => {
                    const item = json.data?.[String(id)];
                    if (!item) return;
                    mapped[ticker] = {
                        price:    item.quote.USD.price,
                        change24h: item.quote.USD.percent_change_24h,
                    };
                });
                updateTicker(mapped);
            } catch {
                updateTicker(fallbackPrices);
            }
        }

        function updateTicker(data) {
            Object.entries(data).forEach(([ticker, info]) => {
                const priceEl  = document.getElementById(`price-${ticker}`);
                const changeEl = document.getElementById(`change-${ticker}`);
                if (priceEl)  priceEl.textContent = formatPrice(info.price);
                if (changeEl) {
                    const change = info.change24h;
                    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
                    changeEl.className = 'ticker-change ' + (change >= 0 ? 'positive' : 'negative');
                }
            });
        }

        function generateFallbackChartData(days) {
            const now = Date.now();
            const step = (days * 24 * 60 * 60 * 1000) / 100;
            let price = COIN_CONFIG[currentCoin]?.basePrice ?? 100;
            return Array.from({ length: 100 }, (_, i) => {
                price += (Math.random() - 0.48) * price * 0.02;
                return [now - (100 - i) * step, price];
            });
        }

        async function fetchChartData() {
            const loading = document.getElementById('chartLoading');
            loading.classList.remove('hidden');

            const params = new URLSearchParams({ coin: currentCoin, days: currentDays });

            try {
                const res = await fetch(`/api/history?${params}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                if (!json.prices || json.prices.length < 2) throw new Error('Недостаточно данных');
                renderChart(json.prices);
            } catch {
                renderChart(generateFallbackChartData(currentDays));
            } finally {
                setTimeout(() => loading.classList.add('hidden'), 300);
            }
        }

        function renderChart(prices) {
            // Downsample if too many points
            const maxPoints = 200;
            let data = prices;
            if (data.length > maxPoints) {
                const step = Math.ceil(data.length / maxPoints);
                data = data.filter((_, i) => i % step === 0);
            }

            const fmtLabel = PERIOD_CONFIG[currentDays].fmt;
            const labels = data.map(p => fmtLabel(p[0]));
            const values = data.map(p => p[1]);

            // Update price info
            const latestPrice = values[values.length - 1];
            const firstPrice = values[0];
            const changePercent = ((latestPrice - firstPrice) / firstPrice * 100);
            const chartPriceEl = document.getElementById('chartPrice');
            const chartChangeEl = document.getElementById('chartChange');

            chartPriceEl.textContent = formatPrice(latestPrice);
            chartChangeEl.textContent = (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%';
            chartChangeEl.className = 'chart-price-change ' + (changePercent >= 0 ? 'positive' : 'negative');

            // Destroy old chart
            if (chartInstance) chartInstance.destroy();

            const cvs = document.getElementById('cryptoChart');
            const cctx = cvs.getContext('2d');

            // Gradient fill
            const gradient = cctx.createLinearGradient(0, 0, 0, cvs.parentElement.clientHeight);
            const isPositive = changePercent >= 0;
            if (isPositive) {
                gradient.addColorStop(0, 'rgba(0, 220, 130, 0.25)');
                gradient.addColorStop(0.5, 'rgba(0, 220, 130, 0.05)');
                gradient.addColorStop(1, 'rgba(0, 220, 130, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(255, 71, 87, 0.25)');
                gradient.addColorStop(0.5, 'rgba(255, 71, 87, 0.05)');
                gradient.addColorStop(1, 'rgba(255, 71, 87, 0)');
            }

            chartInstance = new Chart(cvs, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        borderColor: isPositive ? '#00DC82' : '#FF4757',
                        borderWidth: 2,
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: isPositive ? '#00DC82' : '#FF4757',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(10, 10, 10, 0.95)',
                            titleColor: '#888',
                            bodyColor: '#fff',
                            bodyFont: { family: 'Unbounded', size: 14, weight: '700' },
                            titleFont: { family: 'Manrope', size: 12 },
                            borderColor: '#222',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 14,
                            displayColors: false,
                            callbacks: {
                                label: ctx => formatPrice(ctx.parsed.y),
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255,255,255,0.03)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: '#555',
                                font: { family: 'Manrope', size: 11 },
                                maxTicksLimit: 8,
                                maxRotation: 0,
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255,255,255,0.03)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: '#555',
                                font: { family: 'Manrope', size: 11 },
                                callback: val => {
                                    if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'k';
                                    return '$' + val.toFixed(2);
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1200,
                        easing: 'easeOutQuart',
                    }
                }
            });
        }

        // Coin tabs
        document.getElementById('coinTabs').addEventListener('click', e => {
            const btn = e.target.closest('.coin-tab');
            if (!btn || btn.classList.contains('active')) return;
            document.querySelectorAll('.coin-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentCoin = btn.dataset.coin;
            fetchChartData();
        });

        // Period tabs
        document.getElementById('periodTabs').addEventListener('click', e => {
            const btn = e.target.closest('.period-tab');
            if (!btn || btn.classList.contains('active')) return;
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentDays = parseInt(btn.dataset.days);
            fetchChartData();
        });

        // Initial fetch
        fetchPrices();
        fetchChartData();

        // Poll prices every 60 seconds
        setInterval(fetchPrices, 60000);

        // Poll chart data every 5 minutes
        setInterval(fetchChartData, 300000);

        /* ─── MODAL ─── */
        (function initModal() {
            const modal       = document.getElementById('modal');
            const backdrop    = document.getElementById('modalBackdrop');
            const closeBtn    = document.getElementById('modalClose');
            const form        = document.getElementById('modalForm');
            const nameInput   = document.getElementById('nameInput');
            const phoneInput  = document.getElementById('phoneInput');
            const nameError   = document.getElementById('nameError');
            const phoneError  = document.getElementById('phoneError');
            const successEl   = document.getElementById('modalSuccess');
            const successClose = document.getElementById('modalSuccessClose');

            document.querySelectorAll('.open-modal').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    openModal();
                });
            });

            function openModal() {
                form.style.display = '';
                successEl.classList.remove('is-visible');
                clearErrors();
                const sbw = window.innerWidth - document.documentElement.clientWidth;
                modal.classList.add('is-open');
                document.body.style.overflow = 'hidden';
                document.body.style.paddingRight = sbw + 'px';
                document.getElementById('header').style.paddingRight =
                    'calc(40px + ' + sbw + 'px)';
                setTimeout(() => nameInput.focus(), 400);
            }

            function closeModal() {
                modal.classList.remove('is-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                document.getElementById('header').style.paddingRight = '';
                setTimeout(() => {
                    form.style.display = '';
                    successEl.classList.remove('is-visible');
                    form.reset();
                    phoneInput.value = '';
                    clearErrors();
                }, 400);
            }

            backdrop.addEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
            successClose.addEventListener('click', closeModal);
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
            });

            // Name: auto-capitalize
            nameInput.addEventListener('input', () => {
                const pos = nameInput.selectionStart;
                const raw = nameInput.value;
                const cap = raw.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
                if (cap !== raw) {
                    nameInput.value = cap;
                    nameInput.setSelectionRange(pos, pos);
                }
            });

            // Phone mask
            phoneInput.addEventListener('focus', () => {
                if (!phoneInput.value) phoneInput.value = '+7 (';
            });
            phoneInput.addEventListener('input', maskPhone);
            phoneInput.addEventListener('keydown', e => {
                if (e.key === 'Backspace') {
                    e.preventDefault();
                    if (phoneInput.value.length > 4) phoneInput.value = phoneInput.value.slice(0, -1);
                }
            });

            function maskPhone() {
                let d = phoneInput.value.replace(/\D/g, '').slice(1);
                if (d.length > 10) d = d.slice(0, 10);
                let m = '+7 (';
                if (d.length > 0) m += d.slice(0, 3);
                if (d.length >= 3) m += ') ' + d.slice(3, 6);
                if (d.length >= 6) m += '-' + d.slice(6, 8);
                if (d.length >= 8) m += '-' + d.slice(8, 10);
                phoneInput.value = m;
            }

            function clearErrors() {
                nameInput.closest('.modal__field').classList.remove('has-error');
                phoneInput.closest('.modal__field').classList.remove('has-error');
                nameError.textContent = '';
                phoneError.textContent = '';
            }

            function validate() {
                let ok = true;
                clearErrors();
                if (nameInput.value.trim().length < 2) {
                    nameInput.closest('.modal__field').classList.add('has-error');
                    nameError.textContent = 'Введите ваше имя';
                    ok = false;
                }
                if (phoneInput.value.replace(/\D/g, '').length < 11) {
                    phoneInput.closest('.modal__field').classList.add('has-error');
                    phoneError.textContent = 'Введите полный номер телефона';
                    ok = false;
                }
                return ok;
            }

            form.addEventListener('submit', e => {
                e.preventDefault();
                if (!validate()) return;
                form.style.display = 'none';
                successEl.classList.add('is-visible');
            });
        })();

        /* ─── SMOOTH SCROLL FOR NAV LINKS ─── */
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const target = document.querySelector(a.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    nav.classList.remove('open');
                    menuToggle.classList.remove('open');
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

    })();
