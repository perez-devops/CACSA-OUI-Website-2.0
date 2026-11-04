/**
 * CACSA OUI Website — Core Client Interaction Logic
 * Developed adhering to Senior Front-End Engineering standards:
 * - Event delegation & passive scroll performance
 * - Accessible focus and ARIA state management
 * - Clean teardown and keyboard accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNavigation();
  initDropdownMenus();
  initSmoothScroll();
  initTestimoniesSlider();
  initTenureSlider();
  initExecutivesFilter();
  initContactModalsAndForms();
  initPastTenuresTimeline();
  initTimelineTrain();
  initGivingCopyButtons();
  initWhatsAppFloatingWidget();
});

/**
 * Dynamically adds frosted glass background & border to header upon scrolling
 */
function initNavbarScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Run immediately on page load in case user is already scrolled
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Accessible Mobile Navigation Drawer Controller
 * Handles hamburger button toggle, backdrop dismiss, Escape key,
 * auto-closing on link navigation, and multiple accordion dropdowns.
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('navToggleBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    const firstNavigable = drawer.querySelector('a, button');
    if (firstNavigable) {
      firstNavigable.focus();
    }
  }

  function closeDrawer() {
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  backdrop.addEventListener('click', closeDrawer);

  // Generic Mobile accordion toggles (for About, Academic Area, and any future groups)
  const accordionGroups = drawer.querySelectorAll('.mobile-dropdown-group');
  accordionGroups.forEach((group) => {
    const btn = group.querySelector('.mobile-dropdown-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = group.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // Close drawer when any navigation link inside is clicked
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Handle escape key to dismiss drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
      toggleBtn.focus();
    }
  });
}

/**
 * Accessible Multi-Dropdown Menu Controller (Desktop)
 * Supports all .nav-dropdown-wrapper instances dynamically with click,
 * hover, keyboard (Escape), and outside-click dismissal.
 */
function initDropdownMenus() {
  const wrappers = document.querySelectorAll('.nav-dropdown-wrapper');
  if (!wrappers.length) return;

  function closeAllDropdowns(exceptWrapper) {
    wrappers.forEach((wrapper) => {
      if (wrapper !== exceptWrapper) {
        wrapper.classList.remove('open');
        const btn = wrapper.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  wrappers.forEach((wrapper) => {
    const btn = wrapper.querySelector('.nav-dropdown-btn');
    const menu = wrapper.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllDropdowns(wrapper);
      const shouldOpen = !isOpen;
      wrapper.classList.toggle('open', shouldOpen);
      btn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    });

    // Close menu when clicking any dropdown link
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape key and return focus to button
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrapper.classList.contains('open')) {
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  // Close any open dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown-wrapper')) {
      closeAllDropdowns();
    }
  });
}

/**
 * Smooth scrolling with header offset calculation
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Interactive Testimonies Carousel / Slider Controller
 * Implements smooth snap scrolling, dynamic dot tracking,
 * touch gestures, and gentle auto-progression with pause-on-hover.
 */
function initTestimoniesSlider() {
  const track = document.getElementById('testimoniesTrack');
  const prevBtn = document.getElementById('testimonyPrevBtn');
  const nextBtn = document.getElementById('testimonyNextBtn');
  const dotsContainer = document.getElementById('testimoniesDots');

  if (!track || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll('.testimony-card'));
  if (cards.length === 0) return;

  // Build pagination dots
  dotsContainer.innerHTML = '';
  const dots = cards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === 0 ? 'slider-dot active' : 'slider-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimony ${index + 1} of ${cards.length}`);
    dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => {
      scrollToCard(index);
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  function getStepSize() {
    if (cards.length < 2) return track.clientWidth;
    const firstRect = cards[0].getBoundingClientRect();
    const secondRect = cards[1].getBoundingClientRect();
    return Math.round(secondRect.left - firstRect.left);
  }

  function scrollToCard(index) {
    if (index < 0 || index >= cards.length) return;
    const card = cards[index];
    const trackPaddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const targetScroll = card.offsetLeft - track.offsetLeft - trackPaddingLeft;
    track.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }

  // Next and Previous navigation handlers (if arrows present)
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const step = getStepSize();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 15) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: step, behavior: 'smooth' });
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const step = getStepSize();
      if (track.scrollLeft <= 15) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -step, behavior: 'smooth' });
      }
    });
  }

  // Track active dot on scroll
  let isTicking = false;
  const updateActiveDot = () => {
    const trackRect = track.getBoundingClientRect();
    const viewCenter = trackRect.left + trackRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, i) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(viewCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    dots.forEach((dot, i) => {
      const isActive = i === closestIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    isTicking = false;
  };

  track.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateActiveDot);
      isTicking = true;
    }
  }, { passive: true });

  // Accessible keyboard navigation
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextBtn.click();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevBtn.click();
    }
  });

  // Gentle auto-slide (every 6.5s) with pause on hover/focus
  let autoSlideTimer = null;
  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      // Don't auto-slide if user is currently interacting or prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion && document.visibilityState === 'visible') {
        const step = getStepSize();
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 20) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 6500);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  };

  // Pause auto-slide when mouse enters slider or focused
  const sliderWrapper = document.getElementById('testimoniesSlider');
  if (sliderWrapper) {
    sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
    sliderWrapper.addEventListener('mouseleave', startAutoSlide);
    sliderWrapper.addEventListener('touchstart', stopAutoSlide, { passive: true });
    sliderWrapper.addEventListener('focusin', stopAutoSlide);
    sliderWrapper.addEventListener('focusout', startAutoSlide);
  }

  startAutoSlide();
}

/**
 * Interactive Current Tenure Card Slider (President & Theme Flyer)
 */
function initTenureSlider() {
  const sliderFrame = document.getElementById('tenureSlider');
  if (!sliderFrame) return;

  const slides = Array.from(sliderFrame.querySelectorAll('.tenure-slide'));
  const prevBtn = document.getElementById('tenurePrevBtn');
  const nextBtn = document.getElementById('tenureNextBtn');
  const dotsContainer = document.getElementById('tenureDots');
  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.tenure-dot')) : [];

  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoTimer = null;

  function showSlide(index) {
    if (index < 0) {
      index = slides.length - 1;
    } else if (index >= slides.length) {
      index = 0;
    }

    currentIndex = index;

    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoPlay();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(targetIndex)) {
        showSlide(targetIndex);
        restartAutoPlay();
      }
    });
  });

  // Auto-play every 5.5s
  function startAutoPlay() {
    stopAutoPlay();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && document.visibilityState === 'visible') {
      autoTimer = setInterval(nextSlide, 5500);
    }
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Pause on hover, touch, or focus
  const wrapper = document.getElementById('tenureSliderWrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);
    wrapper.addEventListener('focusin', stopAutoPlay);
    wrapper.addEventListener('focusout', startAutoPlay);
    wrapper.addEventListener('touchstart', stopAutoPlay, { passive: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  });

  startAutoPlay();
}

/**
 * Global helpers for opening and closing contact page modals
 */
function openContactModal(modalId) {
  const targetModal = document.getElementById(modalId);
  const backdrop = document.getElementById('contactModalBackdrop');
  if (!targetModal) return;

  document.querySelectorAll('.contact-modal').forEach((m) => m.classList.remove('active'));
  targetModal.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  const firstInput = targetModal.querySelector('input, select, textarea, button');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 80);
  }
}

function closeContactModal() {
  document.querySelectorAll('.contact-modal').forEach((m) => m.classList.remove('active'));
  const backdrop = document.getElementById('contactModalBackdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// Expose globally to window
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;

/**
 * Accessible Modal Controller & Contact Forms Handler
 */
function initContactModalsAndForms() {
  const backdrop = document.getElementById('contactModalBackdrop');
  const toast = document.getElementById('toastNotification');

  function showToast(message) {
    if (!toast) return;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // Event delegation on document for all modal triggers
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-modal-open]');
    if (openBtn) {
      e.preventDefault();
      const targetId = openBtn.getAttribute('data-modal-open');
      if (targetId) openContactModal(targetId);
      return;
    }

    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      e.preventDefault();
      closeContactModal();
      return;
    }

    // Dismiss when clicking directly on the dark backdrop or modal container
    if (e.target.classList.contains('contact-modal-backdrop') || e.target.classList.contains('contact-modal')) {
      closeContactModal();
    }
  });

  // Escape key closes any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.contact-modal.active');
      if (activeModal) {
        closeContactModal();
      }
    }
  });

  // Form submission handler
  function handleFormSubmit(formId, successMsg) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 0.8s linear infinite;" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <span>Submitting...</span>
        `;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        form.reset();
        closeContactModal();
        showToast(successMsg);
      }, 700);
    });
  }

  // Hook up all forms
  handleFormSubmit(
    'contactMessageForm',
    'Thank you! Your message has been sent. We will reach out to you shortly.'
  );
  handleFormSubmit(
    'memberRegistrationForm',
    'Thank you for registering! Welcome to CACSA OUI. We look forward to fellowship with you.'
  );
  handleFormSubmit(
    'counsellingForm',
    'Your counselling request has been received confidentially. A pastor/counsellor will reach out soon.'
  );
  handleFormSubmit(
    'firstTimerForm',
    'Welcome to CACSA OUI! We are excited to meet and connect with you.'
  );
  handleFormSubmit(
    'secondTimerForm',
    'Welcome back to CACSA OUI! We are glad to continue walking with you in Christ.'
  );
}

/**
 * Executives Council Filter Logic
 */
function initExecutivesFilter() {
  const filterBtns = document.querySelectorAll('.exco-filter-btn');
  const cards = document.querySelectorAll('.executive-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');
      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          setTimeout(() => {
            if (btn.getAttribute('data-filter') !== 'all' && card.getAttribute('data-category') !== btn.getAttribute('data-filter')) {
              card.style.display = 'none';
            }
          }, 180);
        }
      });
    });
  });
}

/**
 * Past Tenures Timeline Controller
 * - Toggles timeline visibility when "See Past Tenures" is clicked
 * - Handles hash navigation (#past-tenures)
 * - Smoothly scrolls to timeline when opened
 */
function initPastTenuresTimeline() {
  const btn = document.getElementById('seePastTenuresBtn');
  const section = document.getElementById('past-tenures');
  if (!btn || !section) return;

  const btnText = btn.querySelector('span');

  const openTimeline = (scroll = true) => {
    section.classList.add('is-open');
    btn.classList.add('is-expanded');
    btn.setAttribute('aria-expanded', 'true');
    if (btnText) btnText.textContent = 'Hide Past Tenures';
    if (scroll) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const closeTimeline = () => {
    section.classList.remove('is-open');
    btn.classList.remove('is-expanded');
    btn.setAttribute('aria-expanded', 'false');
    if (btnText) btnText.textContent = 'See Past Tenures';
  };

  btn.addEventListener('click', () => {
    const isOpen = section.classList.contains('is-open');
    if (isOpen) {
      closeTimeline();
    } else {
      openTimeline(true);
    }
  });

  // If page loaded with #past-tenures hash, automatically open and scroll
  if (window.location.hash === '#past-tenures') {
    openTimeline(true);
  }

  // Also listen for hash changes (e.g. user clicks navbar "Past Tenures" link)
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#past-tenures') {
      openTimeline(true);
    }
  });
}

/**
 * Scroll-Driven Timeline Train Controller
 * Animates a glowing train line with a train-head node downward along the timeline rail
 * as the user scrolls, lighting up milestone dots as the train passes each season.
 */
function initTimelineTrain() {
  const rail = document.querySelector('.timeline-rail');
  const train = document.getElementById('timelineTrain');
  const items = document.querySelectorAll('.timeline-item');

  if (!rail || !train || items.length === 0) return;

  let ticking = false;

  function updateTrain() {
    const railRect = rail.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Focus trigger cursor at 50% down the viewport (user's eye-line)
    const triggerPoint = windowHeight * 0.5;

    const railTop = railRect.top;
    const railHeight = railRect.height;

    let progress = 0;
    if (railHeight > 0) {
      progress = (triggerPoint - railTop) / railHeight;
      progress = Math.max(0, Math.min(1, progress));
    }

    // Move the train line down
    train.style.height = `${(progress * 100).toFixed(2)}%`;

    // Light up dots of milestones the train head has passed
    items.forEach((item) => {
      const marker = item.querySelector('.timeline-marker');
      if (marker) {
        const markerRect = marker.getBoundingClientRect();
        // If marker is at or above the train's trigger point, mark as passed
        if (markerRect.top <= triggerPoint) {
          item.classList.add('passed');
        } else {
          item.classList.remove('passed');
        }
      }
    });

    ticking = false;
  }

  function onScrollOrResize() {
    if (!ticking) {
      window.requestAnimationFrame(updateTrain);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  // Initial update
  updateTrain();
}




/**
 * One-click Copy-to-Clipboard logic for giving account numbers
 */
function initGivingCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn[data-copy-target]');
  const toast = document.getElementById('copyToast');
  const toastMessage = document.getElementById('copyToastMessage');
  let toastTimeout = null;

  if (!copyButtons.length) return;

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden', 'true');
    }, 2800);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const accountText = targetEl.textContent.trim();
      const originalHTML = btn.innerHTML;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(accountText);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = accountText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        btn.classList.add('copied');
        btn.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span class="copy-text">Copied! ✓</span>
        `;
        showToast(`Account number (${accountText}) copied to clipboard!`);

        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalHTML;
        }, 2500);
      } catch (err) {
        console.error('Failed to copy account number:', err);
        showToast('Could not copy automatically. Please copy manually.');
      }
    });
  });
}

/**
 * CACSA OUI Floating WhatsApp Assistance Widget & Multi-Coordinator Directory
 * - Injects floating WhatsApp FAB, periodic assistance callout bubble & modal directory
 * - Signals visitors with "Are you a Fresher or Need Assistance?"
 * - Provides direct links to 4 fellowship leaders with prefilled website message
 * - Full ARIA keyboard accessibility, escape dismiss & backdrop clickaway
 */
function initWhatsAppFloatingWidget() {
  if (document.getElementById('cacsaWaWidget')) return;

  const contacts = [
    {
      name: 'Bro. Emmanuel',
      displayPhone: '0811 048 1225',
      intlPhone: '2348110481225',
      role: 'Student & Freshers Support',
      initials: 'BE',
      accentColor: 'linear-gradient(135deg, #054d2a 0%, #0d8a4d 100%)'
    },
    {
      name: 'Bro. Busayo',
      displayPhone: '0816 877 4370',
      intlPhone: '2348168774370',
      role: 'Fellowship Guidance & Enquiries',
      initials: 'BB',
      accentColor: 'linear-gradient(135deg, #086b3b 0%, #16a34a 100%)'
    },
    {
      name: 'Sis. Oluwatosin',
      displayPhone: '0902 312 4360',
      intlPhone: '2349023124360',
      role: 'Sisters & Welfare Coordinator',
      initials: 'SO',
      accentColor: 'linear-gradient(135deg, #065f46 0%, #059669 100%)'
    },
    {
      name: 'Bro. Destiny',
      displayPhone: '0906 842 8592',
      intlPhone: '2349068428592',
      role: 'Academic & Spiritual Guidance',
      initials: 'BD',
      accentColor: 'linear-gradient(135deg, #044e2b 0%, #087443 100%)'
    }
  ];

  const defaultMessage = 'Hello! I am reaching out from the CACSA OUI website. I am a fresher / I need assistance.';
  const encodedMessage = encodeURIComponent(defaultMessage);

  // Backdrop overlay
  const backdrop = document.createElement('div');
  backdrop.className = 'cacsa-wa-backdrop';
  backdrop.id = 'cacsaWaBackdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  // Widget container
  const widget = document.createElement('aside');
  widget.className = 'cacsa-wa-widget';
  widget.id = 'cacsaWaWidget';
  widget.setAttribute('aria-label', 'CACSA OUI WhatsApp Assistance');

  // Contacts HTML list
  const contactsHTML = contacts
    .map((c) => {
      const waUrl = `https://wa.me/${c.intlPhone}?text=${encodedMessage}`;
      return `
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="cacsa-wa-contact-card" role="listitem" aria-label="Chat with ${c.name} (${c.role}) on WhatsApp">
          <div class="cacsa-wa-avatar" style="background: ${c.accentColor};" aria-hidden="true">
            <span>${c.initials}</span>
            <span class="cacsa-wa-status-dot"></span>
          </div>
          <div class="cacsa-wa-contact-info">
            <div class="cacsa-wa-contact-name">${c.name}</div>
            <span class="cacsa-wa-contact-role">${c.role}</span>
            <span class="cacsa-wa-contact-phone">${c.displayPhone}</span>
          </div>
          <div class="cacsa-wa-contact-btn" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </div>
        </a>
      `;
    })
    .join('');

  widget.innerHTML = `
    <!-- Periodic Callout Notification Bubble -->
    <div class="cacsa-wa-callout" id="cacsaWaCallout" role="status" aria-live="polite">
      <div class="cacsa-wa-callout-header">
        <span class="cacsa-wa-callout-badge">
          <span class="cacsa-wa-callout-badge-dot" aria-hidden="true"></span>
          Campus Support
        </span>
        <button type="button" class="cacsa-wa-callout-close" id="cacsaWaCalloutClose" aria-label="Dismiss assistance prompt">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="cacsa-wa-callout-body">
        <h4 class="cacsa-wa-callout-title">Are you a Fresher or Need Assistance?</h4>
        <p class="cacsa-wa-callout-text">Chat directly with our fellowship leaders on WhatsApp for enquiries, guidance & registration.</p>
        <span class="cacsa-wa-callout-cta">
          Choose a coordinator
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
      </div>
    </div>

    <!-- Contact Directory Modal -->
    <div class="cacsa-wa-modal" id="cacsaWaModal" role="dialog" aria-modal="true" aria-labelledby="cacsaWaModalTitle" aria-hidden="true">
      <div class="cacsa-wa-modal-header">
        <div class="cacsa-wa-modal-topline">
          <div class="cacsa-wa-modal-brand">
            <span class="cacsa-wa-brand-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </span>
            <span class="cacsa-wa-brand-label">CACSA OUI Help Desk</span>
          </div>
          <button type="button" class="cacsa-wa-modal-close" id="cacsaWaModalClose" aria-label="Close contact selector">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <h3 class="cacsa-wa-modal-title" id="cacsaWaModalTitle">Are you a Fresher or Need Assistance?</h3>
        <p class="cacsa-wa-modal-desc">Choose which fellowship leader you would like to message on WhatsApp:</p>
      </div>

      <div class="cacsa-wa-contact-list" role="list">
        ${contactsHTML}
      </div>

      <div class="cacsa-wa-modal-footer">
        <p class="cacsa-wa-footer-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Direct response from CACSA fellowship leaders
        </p>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button type="button" class="cacsa-wa-fab" id="cacsaWaFab" aria-label="Chat with CACSA OUI on WhatsApp" aria-expanded="false" aria-haspopup="dialog">
      <span class="cacsa-wa-pulse-ring" aria-hidden="true"></span>
      <span class="cacsa-wa-icon-chat" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </span>
      <span class="cacsa-wa-icon-close" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    </button>
  `;

  document.body.appendChild(widget);

  // References
  const fab = document.getElementById('cacsaWaFab');
  const modal = document.getElementById('cacsaWaModal');
  const modalClose = document.getElementById('cacsaWaModalClose');
  const callout = document.getElementById('cacsaWaCallout');
  const calloutClose = document.getElementById('cacsaWaCalloutClose');

  let isModalOpen = false;
  let calloutHideTimeout = null;
  let calloutDismissedTemporarily = false;

  // Signal control functions
  function showCallout() {
    if (isModalOpen || calloutDismissedTemporarily) return;
    callout.classList.add('is-visible');

    // Auto-hide after 9 seconds if not interacted
    clearTimeout(calloutHideTimeout);
    calloutHideTimeout = setTimeout(() => {
      hideCallout();
    }, 9000);
  }

  function hideCallout() {
    clearTimeout(calloutHideTimeout);
    callout.classList.remove('is-visible');
  }

  // Modal control functions
  function openModal() {
    hideCallout();
    isModalOpen = true;
    modal.classList.add('is-open');
    backdrop.classList.add('is-active');
    fab.classList.add('is-open');
    fab.setAttribute('aria-expanded', 'true');
    modal.setAttribute('aria-hidden', 'false');

    // Focus first contact for keyboard navigation
    const firstContact = modal.querySelector('.cacsa-wa-contact-card');
    if (firstContact) {
      setTimeout(() => firstContact.focus(), 150);
    }
  }

  function closeModal() {
    isModalOpen = false;
    modal.classList.remove('is-open');
    backdrop.classList.remove('is-active');
    fab.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
    modal.setAttribute('aria-hidden', 'true');
  }

  function toggleModal() {
    if (isModalOpen) {
      closeModal();
    } else {
      openModal();
    }
  }

  // Event Listeners
  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleModal();
  });

  modalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
    fab.focus();
  });

  backdrop.addEventListener('click', () => {
    closeModal();
  });

  // Callout interactions: clicking anywhere on the callout (except close button) opens the modal
  callout.addEventListener('click', (e) => {
    if (e.target.closest('#cacsaWaCalloutClose')) return;
    openModal();
  });

  calloutClose.addEventListener('click', (e) => {
    e.stopPropagation();
    hideCallout();
    calloutDismissedTemporarily = true;
    // Reset temporary dismiss after 90 seconds so user can be reminded later if still browsing
    setTimeout(() => {
      calloutDismissedTemporarily = false;
    }, 90000);
  });

  // Keyboard accessibility: Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
      fab.focus();
    }
  });

  // Close modal when user clicks a contact to launch WhatsApp
  const contactLinks = modal.querySelectorAll('.cacsa-wa-contact-card');
  contactLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        closeModal();
      }, 400);
    });
  });

  // Periodic signaling timing:
  // 1. Initial signal after 3.5 seconds
  setTimeout(() => {
    showCallout();
  }, 3500);

  // 2. Periodic gentle reminder every 45 seconds if visitor is still on page
  setInterval(() => {
    showCallout();
  }, 45000);
}
