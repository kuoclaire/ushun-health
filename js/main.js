/* ==========================================================================
   House of Fok (USHUN Health) - Interactive Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Certificate Lightbox Handling
  const certificateWrappers = document.querySelectorAll('.certificate-image-wrapper');
  const lightboxModal = document.getElementById('certificateLightbox');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaptionContent = document.getElementById('lightboxCaptionContent');

  let activeTriggerElement = null;

  function openLightbox(wrapper) {
    activeTriggerElement = wrapper;
    const imgElement = wrapper.querySelector('.certificate-img');
    const captionElement = wrapper.parentElement.querySelector('.certificate-caption');

    if (imgElement && lightboxImg) {
      lightboxImg.src = imgElement.src;
      lightboxImg.alt = imgElement.alt;
    }

    if (captionElement && lightboxCaptionContent) {
      lightboxCaptionContent.innerHTML = captionElement.innerHTML;
    }

    if (lightboxModal) {
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (activeTriggerElement) {
        activeTriggerElement.focus();
        activeTriggerElement = null;
      }
    }
  }

  certificateWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => openLightbox(wrapper));
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(wrapper);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Personalized Treatment Plan Animated GIF on Hover / Section Scroll
  const planGraphicImg = document.getElementById('planGraphicImg');
  const planGraphicSection = document.getElementById('planGraphicSection');

  let gifTimeout = null;
  let isPlaying = false;

  function playGraphicAnimation() {
    if (!planGraphicImg || isPlaying) return;
    isPlaying = true;
    
    // Switch source to GIF with timestamp query parameter to restart animation cleanly
    const gifPath = 'assets/images/ushun-plan-graphic.gif?t=' + Date.now();
    planGraphicImg.src = gifPath;

    // After animation duration (~3.8s), revert to static JPG
    clearTimeout(gifTimeout);
    gifTimeout = setTimeout(() => {
      planGraphicImg.src = 'assets/images/ushun-plan-graphic.jpg';
      isPlaying = false;
    }, 3800);
  }

  if (planGraphicSection && planGraphicImg) {
    // Mouseenter trigger
    planGraphicSection.addEventListener('mouseenter', () => {
      playGraphicAnimation();
    });

    // IntersectionObserver scroll trigger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playGraphicAnimation();
        }
      });
    }, { threshold: 0.4 });

    observer.observe(planGraphicSection);
  }

  // Smooth Scroll Anchor Links for all #book and internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
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
});
