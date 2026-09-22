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

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

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

  // Next and Previous navigation handlers
  nextBtn.addEventListener('click', () => {
    const step = getStepSize();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 15) {
      // Loop back to start smoothly
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: step, behavior: 'smooth' });
    }
  });

  prevBtn.addEventListener('click', () => {
    const step = getStepSize();
    if (track.scrollLeft <= 15) {
      // Loop to the end
      const maxScroll = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -step, behavior: 'smooth' });
    }
  });

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
