/* ════════════════════════════════════════════
   DIYA PORTFOLIO — script.js
   ════════════════════════════════════════════ */

'use strict';

/* ── DOM REFS ── */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const heroCanvas  = document.getElementById('heroCanvas');
const contactForm = document.getElementById('contactForm');
const cursorGlow  = document.getElementById('cursorGlow');

/* ════════════════════════════════════════════
   1. CURSOR GLOW
   ════════════════════════════════════════════ */
(function initCursor() {
  let mx = -1000, my = -1000;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorGlow.style.left = mx + 'px';
    cursorGlow.style.top  = my + 'px';
  });
})();


/* ════════════════════════════════════════════
   2. NAVBAR — scroll state + active link
   ════════════════════════════════════════════ */
(function initNavbar() {
  const links = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
  const sections = [];

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) sections.push({ link, target });
    }
  });

  function onScroll() {
    // Scrolled class
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    const mid = window.scrollY + window.innerHeight / 2;
    let current = null;
    sections.forEach(({ target }) => {
      if (target.offsetTop <= mid) current = target.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ════════════════════════════════════════════
   3. HAMBURGER MENU
   ════════════════════════════════════════════ */
(function initHamburger() {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ════════════════════════════════════════════
   4. HERO CANVAS — Neural Network Particles
   ════════════════════════════════════════════ */
(function initCanvas() {
  if (!heroCanvas) return;
  const ctx = heroCanvas.getContext('2d');
  let W, H, particles, raf;
  const NUM   = 90;
  const DIST  = 130;
  const SPEED = 0.35;

  function resize() {
    W = heroCanvas.width  = heroCanvas.offsetWidth;
    H = heroCanvas.height = heroCanvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * SPEED;
    this.vy = (Math.random() - 0.5) * SPEED;
    this.r  = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.4 + 0.1;
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function initParticles() {
    particles = Array.from({ length: NUM }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update & draw nodes
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 255, ${p.alpha})`;
      ctx.fill();
    });

    // Draw edges
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DIST) {
          const alpha = (1 - dist / DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();

  const ro = new ResizeObserver(() => {
    resize();
    initParticles();
  });
  ro.observe(heroCanvas);
})();


/* ════════════════════════════════════════════
   5. SCROLL REVEAL  (IntersectionObserver)
   ════════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate skill bars once visible
        entry.target.querySelectorAll('.skill-chip').forEach(chip => chip.classList.add('animated'));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════
   6. HERO STAT COUNTERS
   ════════════════════════════════════════════ */
(function initCounters() {
  const nums = document.querySelectorAll('.hero__stat-num[data-target]');
  if (!nums.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let start = 0;
      const step = target / 40;
      const tick = () => {
        start += step;
        if (start >= target) {
          el.textContent = target + '+';
          return;
        }
        el.textContent = Math.floor(start);
        requestAnimationFrame(tick);
      };
      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
})();


/* ════════════════════════════════════════════
   7. TILT EFFECT on project cards
   ════════════════════════════════════════════ */
(function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  const STRENGTH = 8; // degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * STRENGTH;
      const rotY =  dx * STRENGTH;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });

    const reset = () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    };
    card.addEventListener('mouseleave', reset);
  });
})();


/* ════════════════════════════════════════════
   8. HERO PARALLAX (subtle mouse move)
   ════════════════════════════════════════════ */
(function initParallax() {
  const ambients = document.querySelectorAll('.hero__ambient');
  if (!ambients.length) return;

  document.addEventListener('mousemove', e => {
    const xRatio = (e.clientX / window.innerWidth  - 0.5) * 2;
    const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
    ambients.forEach((el, i) => {
      const depth = (i + 1) * 12;
      el.style.transform = `translate(${xRatio * depth}px, ${yRatio * depth}px)`;
    });
  });
})();


/* ════════════════════════════════════════════
   9. CONTACT FORM — client-side UX
   ════════════════════════════════════════════ */
(function initContactForm() {
  if (!contactForm) return;

  const nameInput    = document.getElementById('fname');
  const emailInput   = document.getElementById('femail');
  const msgInput     = document.getElementById('fmessage');
  const nameErr      = document.getElementById('nameError');
  const emailErr     = document.getElementById('emailError');
  const msgErr       = document.getElementById('messageError');
  const submitBtn    = document.getElementById('submitBtn');
  const formSuccess  = document.getElementById('formSuccess');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(input, errEl, msg) {
    input.classList.add('error');
    errEl.textContent = msg;
  }
  function clearError(input, errEl) {
    input.classList.remove('error');
    errEl.textContent = '';
  }

  // Live validation
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length >= 2) clearError(nameInput, nameErr);
  });
  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value.trim())) clearError(emailInput, emailErr);
  });
  msgInput.addEventListener('input', () => {
    if (msgInput.value.trim().length >= 10) clearError(msgInput, msgErr);
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const nameVal  = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const msgVal   = msgInput.value.trim();

    if (nameVal.length < 2) {
      setError(nameInput, nameErr, 'Please enter your name (at least 2 characters).');
      valid = false;
    } else {
      clearError(nameInput, nameErr);
    }

    if (!validateEmail(emailVal)) {
      setError(emailInput, emailErr, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, emailErr);
    }

    if (msgVal.length < 10) {
      setError(msgInput, msgErr, 'Message must be at least 10 characters long.');
      valid = false;
    } else {
      clearError(msgInput, msgErr);
    }

    if (!valid) return;

    // Simulate submission
    submitBtn.disabled = true;
    const origHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending…</span>';

    setTimeout(() => {
      submitBtn.innerHTML = origHTML;
      submitBtn.disabled = false;
      contactForm.reset();
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1200);
  });
})();


/* ════════════════════════════════════════════
   10. SMOOTH ANCHOR SCROLL with offset
   ════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ════════════════════════════════════════════
   11. SECTION BACKGROUND GRID DECORATION
       (Adds subtle CSS grid to sections)
   ════════════════════════════════════════════ */
(function injectGridBg() {
  const style = document.createElement('style');
  style.textContent = `
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
      pointer-events: none;
      z-index: 0;
    }
  `;
  document.head.appendChild(style);
})();


/* ════════════════════════════════════════════
   12. SKILL BARS — animate on scroll
   ════════════════════════════════════════════ */
(function initSkillBars() {
  const skillGroups = document.querySelectorAll('.skill-group');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-chip').forEach((chip, i) => {
          setTimeout(() => chip.classList.add('animated'), i * 80);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillGroups.forEach(g => observer.observe(g));
})();
