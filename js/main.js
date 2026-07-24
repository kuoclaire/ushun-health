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
