/**
 * ================================================================
 * PORTFOLIO JAVASCRIPT — Hanish Aradhya G
 * Handles: Theme toggle, Animations, Typewriter, Particles,
 *          Skill Bars, AOS (Animate on Scroll), Project Filter,
 *          Contact Form Validation, Stats Counter, Scroll-to-Top
 * ================================================================
 */

'use strict';

/* ----------------------------------------------------------------
   1. THEME TOGGLE (Dark / Light Mode)
   ---------------------------------------------------------------- */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const html        = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// On load — apply saved theme or default to dark
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ----------------------------------------------------------------
   2. MOBILE HAMBURGER MENU
   ---------------------------------------------------------------- */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen.toString());
  mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

/* ----------------------------------------------------------------
   3. NAVBAR SCROLL EFFECT & ACTIVE LINK HIGHLIGHT
   ---------------------------------------------------------------- */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Scrolled class for navbar shadow
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Active link highlight
  let currentSection = '';
  sections.forEach(section => {
    const offset = section.offsetTop - 100;
    if (window.scrollY >= offset) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === currentSection) {
      link.classList.add('active');
    }
  });

  // Scroll-to-top button visibility
  scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ----------------------------------------------------------------
   4. SCROLL-TO-TOP BUTTON
   ---------------------------------------------------------------- */
const scrollToTopBtn = document.getElementById('scroll-to-top');

scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ----------------------------------------------------------------
   5. TYPEWRITER / DYNAMIC TEXT EFFECT
   ---------------------------------------------------------------- */
const dynamicText = document.getElementById('dynamic-text');
const words = [
  'Software Developer',
  'Full-Stack Engineer',
  'Python Enthusiast',
  'Algorithm Solver',
  'CS Student',
  'Problem Solver',
];

let wordIndex  = 0;
let charIndex  = 0;
let isDeleting = false;
let typeTimer;

function typeEffect() {
  const currentWord = words[wordIndex];

  if (isDeleting) {
    dynamicText.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    dynamicText.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 60 : 110;

  if (!isDeleting && charIndex === currentWord.length) {
    // Pause at end of word
    speed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    speed = 400;
  }

  typeTimer = setTimeout(typeEffect, speed);
}

// Start typewriter after small delay
setTimeout(typeEffect, 1000);

/* ----------------------------------------------------------------
   6. HERO PARTICLE CANVAS
   ---------------------------------------------------------------- */
const heroCanvas = document.getElementById('hero-canvas');
const ctx        = heroCanvas.getContext('2d');
let particles    = [];
let animFrame;

function resizeCanvas() {
  heroCanvas.width  = heroCanvas.offsetWidth;
  heroCanvas.height = heroCanvas.offsetHeight;
}

function createParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * heroCanvas.width,
      y: Math.random() * heroCanvas.height,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: Math.random() > 0.5 ? '99, 102, 241' : '6, 182, 212',
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

  particles.forEach((p, i) => {
    // Move particle
    p.x += p.vx;
    p.y += p.vy;

    // Wrap around
    if (p.x < 0) p.x = heroCanvas.width;
    if (p.x > heroCanvas.width) p.x = 0;
    if (p.y < 0) p.y = heroCanvas.height;
    if (p.y > heroCanvas.height) p.y = 0;

    // Draw particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
    ctx.fill();

    // Draw lines between close particles
    for (let j = i + 1; j < particles.length; j++) {
      const q    = particles[j];
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      if (dist < 120) {
        const opacity = (1 - dist / 120) * 0.15;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  });

  animFrame = requestAnimationFrame(drawParticles);
}

function initCanvas() {
  resizeCanvas();
  createParticles(80);
  cancelAnimationFrame(animFrame);
  drawParticles();
}

window.addEventListener('resize', initCanvas);
initCanvas();

/* ----------------------------------------------------------------
   7. AOS — ANIMATE ON SCROLL (Lightweight custom implementation)
   ---------------------------------------------------------------- */
const aosElements = document.querySelectorAll('[data-aos]');

const aosObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-aos-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
        aosObserver.unobserve(entry.target); // Animate only once
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

aosElements.forEach(el => aosObserver.observe(el));

/* ----------------------------------------------------------------
   8. ANIMATED STATISTICS COUNTER
   ---------------------------------------------------------------- */
const statNumbers = document.querySelectorAll('.stat-number');

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        let current  = 0;
        const step   = Math.ceil(target / 50);
        const timer  = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(timer);
        }, 30);
        statObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

statNumbers.forEach(el => statObserver.observe(el));

/* ----------------------------------------------------------------
   9. SKILL BAR ANIMATION
   ---------------------------------------------------------------- */
const skillBars = document.querySelectorAll('.skill-bar');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar  = entry.target;
        const fill = bar.querySelector('.skill-fill');
        const w    = bar.getAttribute('data-width');
        // Small delay for effect
        setTimeout(() => { fill.style.width = w + '%'; }, 100);
        skillObserver.unobserve(bar);
      }
    });
  },
  { threshold: 0.3 }
);

skillBars.forEach(bar => skillObserver.observe(bar));

/* ----------------------------------------------------------------
   10. SKILL CARD FILTER
   ---------------------------------------------------------------- */
const skillFilterTabs = document.querySelectorAll('.skill-filter-tabs .filter-tab');
const allSkillCards   = document.querySelectorAll('.skill-card');

skillFilterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Active tab
    skillFilterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.getAttribute('data-filter');

    allSkillCards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.classList.remove('hidden-filter');
        // Re-animate skill bar
        const fill = card.querySelector('.skill-fill');
        const bar  = card.querySelector('.skill-bar');
        if (fill && bar) {
          fill.style.width = '0%';
          setTimeout(() => { fill.style.width = bar.getAttribute('data-width') + '%'; }, 150);
        }
      } else {
        card.classList.add('hidden-filter');
      }
    });
  });
});

/* ----------------------------------------------------------------
   11. PROJECT CARD FILTER
   ---------------------------------------------------------------- */
const projectFilterTabs = document.querySelectorAll('.project-filter-tabs .filter-tab');
const allProjectCards   = document.querySelectorAll('.project-card');

projectFilterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    projectFilterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.getAttribute('data-project-filter');

    allProjectCards.forEach(card => {
      const tags = card.getAttribute('data-tags') || '';
      if (filter === 'all' || tags.includes(filter)) {
        card.classList.remove('hidden-project');
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.classList.add('hidden-project');
      }
    });
  });
});

/* ----------------------------------------------------------------
   12. CONTACT FORM VALIDATION & SUBMISSION
   ---------------------------------------------------------------- */
const contactForm    = document.getElementById('contact-form');
const submitBtn      = document.getElementById('form-submit-btn');
const formSuccess    = document.getElementById('form-success');
const btnText        = submitBtn.querySelector('.btn-text');
const btnLoading     = submitBtn.querySelector('.btn-loading');

/**
 * Validate a single field and display/clear error.
 * @param {HTMLElement} input — the input/textarea element
 * @param {HTMLElement} errorEl — the span to show error
 * @param {Function}    validator — returns error string or ''
 */
function validateField(input, errorEl, validator) {
  const error = validator(input.value.trim());
  errorEl.textContent = error;
  if (error) {
    input.classList.add('error');
    input.closest('.input-wrapper').querySelector('.input-icon')
         ?.style.setProperty('color', '#ef4444');
  } else {
    input.classList.remove('error');
    input.closest('.input-wrapper').querySelector('.input-icon')
         ?.style.removeProperty('color');
  }
  return !error;
}

const fields = [
  {
    input: document.getElementById('contact-name'),
    error: document.getElementById('name-error'),
    validator: v => v.length < 2 ? 'Please enter your full name (min 2 characters).' : '',
  },
  {
    input: document.getElementById('contact-email'),
    error: document.getElementById('email-error'),
    validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.',
  },
  {
    input: document.getElementById('contact-subject'),
    error: document.getElementById('subject-error'),
    validator: v => v.length < 3 ? 'Please enter a subject (min 3 characters).' : '',
  },
  {
    input: document.getElementById('contact-message'),
    error: document.getElementById('message-error'),
    validator: v => v.length < 20 ? 'Message must be at least 20 characters long.' : '',
  },
];

// Live validation on input
fields.forEach(({ input, error, validator }) => {
  input.addEventListener('input', () => validateField(input, error, validator));
  input.addEventListener('blur', () => validateField(input, error, validator));
});

// Form submit handler
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate all fields
  let isValid = true;
  fields.forEach(({ input, error, validator }) => {
    if (!validateField(input, error, validator)) isValid = false;
  });

  if (!isValid) return;

  // Show loading state
  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');
  submitBtn.disabled = true;

  // Simulate async submission (replace with actual fetch/emailjs)
  await new Promise(resolve => setTimeout(resolve, 1800));

  // Reset button
  btnText.classList.remove('hidden');
  btnLoading.classList.add('hidden');
  submitBtn.disabled = false;

  // Show success
  contactForm.querySelector('button[type="submit"]').classList.add('hidden');
  formSuccess.classList.remove('hidden');

  // Reset form fields
  contactForm.reset();

  // Re-show button after 5s
  setTimeout(() => {
    formSuccess.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  }, 6000);
});

/* ----------------------------------------------------------------
   13. FOOTER — DYNAMIC YEAR
   ---------------------------------------------------------------- */
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

/* ----------------------------------------------------------------
   14. SMOOTH SCROLL POLYFILL FOR NAV LINKS
   ---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const yOffset = -80; // offset for fixed nav
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

/* ----------------------------------------------------------------
   15. GITHUB PROFILE INTEGRATION — Fetch pinned repo count
   ---------------------------------------------------------------- */
async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/users/HanishAradhyaG');
    if (!response.ok) return; // silently fail
    const data = await response.json();

    // Update public repos stat if available
    const reposEl = document.querySelector('[data-target="10"]');
    if (reposEl && data.public_repos > 0) {
      reposEl.setAttribute('data-target', data.public_repos);
    }
  } catch (_) {
    // Network errors are silently ignored
  }
}

fetchGitHubStats();

/* ----------------------------------------------------------------
   16. ORBIT DOT ANIMATION FIX
       Overrides are applied directly to keep dots stationary
       relative to the hero photo frame regardless of orbit spin.
   ---------------------------------------------------------------- */
(function fixOrbitDots() {
  const orbitDots = document.querySelectorAll('.orbit-dot');
  const positions = [
    { top: '-20px', left: '50%', transform: 'translateX(-50%)', bottom: '', right: '' },
    { right: '-20px', top: '50%', transform: 'translateY(-50%)', left: '', bottom: '' },
    { bottom: '-20px', left: '50%', transform: 'translateX(-50%)', top: '', right: '' },
    { left: '-20px', top: '50%', transform: 'translateY(-50%)', right: '', bottom: '' },
  ];

  // Remove animation from parent orbit and use JS rotation instead
  const orbit = document.querySelector('.photo-orbit');
  if (!orbit) return;

  orbit.style.animation = 'none';

  let angle = 0;
  let rafId;

  function rotateOrbit() {
    angle += 0.3;
    orbit.style.transform = `rotate(${angle}deg)`;

    // Counter-rotate each dot label
    orbitDots.forEach(dot => {
      dot.style.transform = `rotate(${-angle}deg)`;
    });

    // Reapply position styles each frame to override CSS
    orbitDots.forEach((dot, i) => {
      const pos = positions[i];
      if (!pos) return;
      Object.assign(dot.style, pos);
    });

    rafId = requestAnimationFrame(rotateOrbit);
  }

  rotateOrbit();
})();

/* ----------------------------------------------------------------
   17. MICRO-INTERACTIONS — Button ripple effect
   ---------------------------------------------------------------- */
document.querySelectorAll('.btn, .filter-tab, .overlay-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      width: 10px;
      height: 10px;
      top: ${e.offsetY - 5}px;
      left: ${e.offsetX - 5}px;
      transform: scale(0);
      animation: rippleAnim 0.5s ease forwards;
      pointer-events: none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Inject ripple keyframe dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(20); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

/* ----------------------------------------------------------------
   18. KEYBOARD ACCESSIBILITY — Close mobile menu on Escape
   ---------------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  }
});

/* ----------------------------------------------------------------
   19. PERFORMANCE — Lazy load images with IntersectionObserver
   ---------------------------------------------------------------- */
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        imgObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => imgObserver.observe(img));
}

/* ----------------------------------------------------------------
   20. PAGE LOAD — Trigger initial animations
   ---------------------------------------------------------------- */
window.addEventListener('load', () => {
  // Trigger above-fold hero animations
  document.querySelectorAll('.hero-content [data-aos], .hero-photo [data-aos]').forEach(el => {
    el.classList.add('aos-animate');
  });
  // Initial scroll check
  onScroll();
});

console.log('%c🚀 Portfolio by Hanish Aradhya G', 
  'background: linear-gradient(135deg, #6366f1, #06b6d4); color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold;');
console.log('%c👋 Thanks for checking the source!', 'color: #94a3b8; font-size: 12px;');
