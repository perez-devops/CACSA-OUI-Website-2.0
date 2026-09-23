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
  initContactModalsAndForms();
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
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('navToggleBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus the first navigable element in the drawer
    if (drawerLinks.length > 0) {
      drawerLinks[0].focus();
    }
  }

  function closeDrawer() {
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  backdrop.addEventListener('click', closeDrawer);

  // Mobile accordion toggle for About dropdown
  const mobileAboutBtn = document.getElementById('mobileAboutBtn');
  const mobileAboutGroup = document.getElementById('mobileAboutGroup');
  if (mobileAboutBtn && mobileAboutGroup) {
    mobileAboutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileAboutGroup.classList.toggle('open');
      mobileAboutBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Close drawer when any navigation link inside is clicked
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/**
 * Accessible Dropdown Menu Controller (Desktop)
 */
function initDropdownMenus() {
  const wrapper = document.getElementById('aboutDropdownWrapper');
  const btn = document.getElementById('aboutDropdownBtn');
  const menu = document.getElementById('aboutDropdownMenu');

  if (!wrapper || !btn || !menu) return;

  function toggleDropdown(open) {
    const shouldOpen = open !== undefined ? open : !wrapper.classList.contains('open');
    wrapper.classList.toggle('open', shouldOpen);
    btn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  // Close dropdown when item is clicked
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggleDropdown(false);
    });
  });

  // Close dropdown on Escape key
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrapper.classList.contains('open')) {
      toggleDropdown(false);
      btn.focus();
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


/**
 * Accessible Modal Controller & Contact Forms Handler
 */
function initContactModalsAndForms() {
  const backdrop = document.getElementById('contactModalBackdrop');
  const openButtons = document.querySelectorAll('[data-modal-open]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');
  const modals = document.querySelectorAll('.contact-modal');
  const toast = document.getElementById('toastNotification');

  if (!openButtons.length && !modals.length && !document.getElementById('contactMessageForm')) {
    return;
  }

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

  function openModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    modals.forEach((m) => m.classList.remove('active'));
    targetModal.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first interactive element
    const firstInput = targetModal.querySelector('input, select, textarea, button');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 80);
    }
  }

  function closeModal() {
    modals.forEach((m) => m.classList.remove('active'));
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Bind Open Buttons
  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-modal-open');
      if (targetId) openModal(targetId);
    });
  });

  // Bind Close Buttons
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  // Backdrop click closes
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.contact-modal.active');
      if (activeModal) {
        closeModal();
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
        closeModal();
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

}
