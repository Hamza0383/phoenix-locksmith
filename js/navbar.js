/**
 * Phoenix Locksmith - Navigation JavaScript
 * Handles mobile menu toggle, dropdowns, and accessibility
 */

(function() {
  'use strict';

  // DOM Elements
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  const body = document.body;

  // Breakpoint for desktop
  const DESKTOP_BREAKPOINT = 1024;

  // Cached state to avoid forced reflows
  let isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
  let resizeTimeout = null;

  /**
   * Update cached desktop state (called on resize)
   */
  function updateDesktopState() {
    isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  /**
   * Toggle mobile menu open/close
   */
  function toggleMobileMenu() {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', !isOpen);
    navMenu.classList.toggle('is-active');
    body.classList.toggle('menu-open');

    // If closing menu, also close all dropdowns
    if (isOpen) {
      closeAllDropdowns();
    }
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-active');
    body.classList.remove('menu-open');
    closeAllDropdowns();
  }

  /**
   * Close all dropdown menus
   */
  function closeAllDropdowns() {
    navDropdowns.forEach(dropdown => {
      dropdown.classList.remove('is-open');
      const dropdownToggle = dropdown.querySelector('a[aria-haspopup]');
      if (dropdownToggle) {
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Toggle dropdown menu
   * @param {HTMLElement} dropdown - The dropdown element
   * @param {Event} event - The click event
   */
  function toggleDropdown(dropdown, event) {
    const dropdownToggle = dropdown.querySelector('a[aria-haspopup]');

    // On mobile, prevent default link behavior and toggle dropdown
    if (!isDesktop) {
      event.preventDefault();

      const isOpen = dropdown.classList.contains('is-open');

      // Close other dropdowns first
      navDropdowns.forEach(d => {
        if (d !== dropdown) {
          d.classList.remove('is-open');
          const toggle = d.querySelector('a[aria-haspopup]');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // Toggle current dropdown
      dropdown.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', !isOpen);
    }
  }

  /**
   * Handle click outside menu to close it
   * @param {Event} event - The click event
   */
  function handleClickOutside(event) {
    const isMenuOpen = navMenu.classList.contains('is-active');
    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedOnToggle = menuToggle.contains(event.target);

    if (isMenuOpen && !clickedInsideMenu && !clickedOnToggle) {
      closeMobileMenu();
    }
  }

  /**
   * Handle window resize (debounced)
   * Close mobile menu when resizing to desktop
   */
  function handleResize() {
    // Debounce resize events
    if (resizeTimeout) {
      cancelAnimationFrame(resizeTimeout);
    }

    resizeTimeout = requestAnimationFrame(() => {
      updateDesktopState();
      if (isDesktop) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Handle escape key press
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleEscapeKey(event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  }

  /**
   * Handle keyboard navigation for dropdowns
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleDropdownKeyboard(event) {
    const dropdown = event.target.closest('.nav-dropdown');

    if (!dropdown) return;

    if (event.key === 'Enter' || event.key === ' ') {
      if (!isDesktop) {
        toggleDropdown(dropdown, event);
      }
    }

    if (event.key === 'Escape') {
      dropdown.classList.remove('is-open');
      const toggle = dropdown.querySelector('a[aria-haspopup]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    }
  }

  /**
   * Initialize event listeners
   */
  function init() {
    // Menu toggle click
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Dropdown toggles
    navDropdowns.forEach(dropdown => {
      const dropdownToggle = dropdown.querySelector('a[aria-haspopup]');

      if (dropdownToggle) {
        // Click handler
        dropdownToggle.addEventListener('click', (event) => {
          toggleDropdown(dropdown, event);
        });

        // Keyboard handler
        dropdownToggle.addEventListener('keydown', handleDropdownKeyboard);
      }

      // Desktop hover behavior
      dropdown.addEventListener('mouseenter', () => {
        if (isDesktop) {
          dropdown.classList.add('is-open');
          const toggle = dropdown.querySelector('a[aria-haspopup]');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
          }
        }
      });

      dropdown.addEventListener('mouseleave', () => {
        if (isDesktop) {
          dropdown.classList.remove('is-open');
          const toggle = dropdown.querySelector('a[aria-haspopup]');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });

    // Close menu when clicking nav links (except dropdown toggles)
    navMenu.querySelectorAll('a:not([aria-haspopup])').forEach(link => {
      link.addEventListener('click', () => {
        if (!isDesktop) {
          closeMobileMenu();
        }
      });
    });

    // Click outside to close
    document.addEventListener('click', handleClickOutside);

    // Window resize (use passive for better scroll performance)
    window.addEventListener('resize', handleResize, { passive: true });

    // Escape key
    document.addEventListener('keydown', handleEscapeKey);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
