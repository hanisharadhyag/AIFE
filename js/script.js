/**
 * Hanish Aradhya G - Portfolio Interactions Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular functions
  initCustomCursor();
  initThemeToggle();
  initMobileMenu();
  initTypingEffect();
  initScrollAnimations();
  initActiveNavLinkSync();
  initScrollProgressAndBackToTop();
  initContactForm();
});

/* ==========================================================================
   1. Custom Dual Cursor (Mouse Pointer Follower)
   ========================================================================== */
function initCustomCursor() {
  const cursorDot = document.getElementById('cursor-dot');
  const cursorCircle = document.getElementById('cursor-circle');
  
  if (!cursorDot || !cursorCircle) return;

  // Disable custom cursor on touchscreen devices for accessibility
  const isTouchDevice = 'ontouchstart' in window || 
                        navigator.maxTouchPoints > 0 || 
                        window.matchMedia('(pointer: coarse)').matches;
  
  if (isTouchDevice) {
    return;
  }

  // Add activation class to body for custom cursor styles
  document.body.classList.add('custom-cursor-enabled');

  let mouseX = 0, mouseY = 0;
  let circleX = 0, circleY = 0;
  let cursorVisible = false;

  // Track cursor position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Position dot instantly
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    // Make cursors visible on first movement
    if (!cursorVisible) {
      cursorDot.style.opacity = '1';
      cursorCircle.style.opacity = '1';
      cursorVisible = true;
    }
  });

  // Smooth lagging loop for the outer circle
  function lerpCircle() {
    const dx = mouseX - circleX;
    const dy = mouseY - circleY;
    
    // Apply inertia factor
    circleX += dx * 0.15;
    circleY += dy * 0.15;
    
    cursorCircle.style.left = `${circleX}px`;
    cursorCircle.style.top = `${circleY}px`;
    
    requestAnimationFrame(lerpCircle);
  }
  requestAnimationFrame(lerpCircle);

  // Hover states using event delegation (more robust for dynamic elements)
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    // Check if pointer is over any link, button, project card, timeline element or customized hover triggers
    const isHoverable = target.closest('a, button, .custom-hover-trigger, .project-card, .timeline-content');
    
    if (isHoverable) {
      cursorDot.classList.add('hovered');
      cursorCircle.classList.add('hovered');
    } else {
      cursorDot.classList.remove('hovered');
      cursorCircle.classList.remove('hovered');
    }
  });

  // Hide cursor when exiting viewport bounds
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorCircle.style.opacity = '0';
    cursorVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
    cursorCircle.style.opacity = '1';
    cursorVisible = true;
  });
}

/* ==========================================================================
   2. Dark / Light Theme Toggle Setup
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Local storage cache key
  const CACHE_KEY = 'hanish-portfolio-theme';

  // Read current saved preference, fall back to dark theme
  const savedTheme = localStorage.getItem(CACHE_KEY) || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }

  // Handle click to cycle theme
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem(CACHE_KEY, 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem(CACHE_KEY, 'dark');
    }
  });
}

/* ==========================================================================
   3. Mobile Hamburger Side-Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.contains('open');
    navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', !isOpen);
  });

  // Close when clicking individual link elements
  const links = navLinks.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile drawer when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== menuToggle) {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   4. Dynamic Typing Role Animation
   ========================================================================== */
function initTypingEffect() {
  const typingTextSpan = document.getElementById('typing-text');
  if (!typingTextSpan) return;

  const roles = [
    "Full-Stack Developer",
    "Creative Problem Solver",
    "UX/UI Specialist",
    "Scalable Systems Engineer"
  ];
  
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  
  const typingSpeed = 100;    // Ms per character typed
  const deletingSpeed = 40;   // Ms per character deleted
  const delayBetweenWords = 2500; // Pause after word completes typing
  
  function type() {
    const currentRole = roles[roleIdx];
    
    if (isDeleting) {
      // Delete characters
      typingTextSpan.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
    } else {
      // Type characters
      typingTextSpan.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
    }
    
    let currentDelay = isDeleting ? deletingSpeed : typingSpeed;
    
    // Check state boundaries
    if (!isDeleting && charIdx === currentRole.length) {
      // Complete typing
      currentDelay = delayBetweenWords;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      // Complete deleting
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      currentDelay = 400; // brief delay before next typing starts
    }
    
    setTimeout(type, currentDelay);
  }

  // Start typing loop after a brief landing delay
  setTimeout(type, 1000);
}

/* ==========================================================================
   5. Scroll-Reveals & Skills Tab Filter Configurations
   ========================================================================== */
function initScrollAnimations() {
  // Elements with .reveal class will animate when entering viewport
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.08, // Trigger when 8% is visible
    rootMargin: '0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Animating Skills Matrix bars on viewport intersect
  const skillBars = document.querySelectorAll('.skill-bar-inner');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
        skillObserver.unobserve(bar);
      }
    });
  }, {
    threshold: 0.15
  });

  skillBars.forEach(bar => skillObserver.observe(bar));

  // Handle Skills Filtering Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Style active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          
          // Re-trigger skill-bar progress animation on visibility toggle
          const innerBar = card.querySelector('.skill-bar-inner');
          if (innerBar) {
            innerBar.style.width = '0%';
            setTimeout(() => {
              innerBar.style.width = innerBar.getAttribute('data-width');
            }, 60);
          }
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   6. Active Nav Link Highlights
   ========================================================================== */
function initActiveNavLinkSync() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!sections.length || !navLinks.length) return;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          const href = link.getAttribute('href').substring(1);
          if (href === currentId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: 0.2, // Trigger active highlights when 20% in view
    rootMargin: '-80px 0px -40% 0px' // Offset top header height
  });

  sections.forEach(section => sectionObserver.observe(section));
}

/* ==========================================================================
   7. Scroll Progress & Back To Top Button Displays
   ========================================================================== */
function initScrollProgressAndBackToTop() {
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  let isScrolling = false;

  // Throttling scrolls to prevent visual performance lag
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateScrollEffects();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  function updateScrollEffects() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Page progress width compute
    if (scrollProgress && documentHeight > 0) {
      const scrollPercent = (scrollTop / documentHeight) * 100;
      scrollProgress.style.width = `${scrollPercent}%`;
    }

    // Toggle Back to top action visibility
    if (backToTopBtn) {
      if (scrollTop > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  // Smooth scroll back up click behavior
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   8. Contact Form Validations & Toasts Actions
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const subjectInput = document.getElementById('form-subject');
  const messageInput = document.getElementById('form-message');

  // Submit listener
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const isFormValid = validateFormFields();
    
    if (isFormValid) {
      // Block submission clicks
      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) submitBtn.disabled = true;

      // Simulate network request duration
      setTimeout(() => {
        showConfirmationToast('Message Sent Successfully!', 'Thank you Hanish. I will connect with you soon.');
        form.reset();
        
        // Re-enable clicks
        if (submitBtn) submitBtn.disabled = false;
      }, 800);
    }
  });

  // Focus out (blur) validation checks for dynamic validation UX
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    if (!input) return;
    input.addEventListener('blur', () => {
      validateSingleField(input);
    });
    // Remove error class as the user types
    input.addEventListener('input', () => {
      const group = input.parentElement;
      group.classList.remove('error');
    });
  });

  function validateSingleField(input) {
    const group = input.parentElement;
    let isFieldValid = true;

    if (input.required && !input.value.trim()) {
      group.classList.add('error');
      isFieldValid = false;
    } else if (input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) {
        group.classList.add('error');
        isFieldValid = false;
      } else {
        group.classList.remove('error');
      }
    } else {
      group.classList.remove('error');
    }

    return isFieldValid;
  }

  function validateFormFields() {
    let isValid = true;
    
    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
      if (!validateSingleField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function showConfirmationToast(title, msg) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    // Create toast frame
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-msg">${msg}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Slide in
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Fade out and release resources
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4500);
  }
}
