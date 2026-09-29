/**
 * FEU ENGENHARIA & SOLUÇÕES - JAVASCRIPT PRINCIPAL
 * Módulos:
 * 1. Sticky Header & Menu Mobile
 * 2. Hero: Carrossel Circular com Transição Fade & Interação Mouse (Tilt Suave)
 * 3. Projetos / Cases: Apresentação Dinâmica de 5 Pares com Entrada/Saída Lateral
 * 4. Nossa Equipe: Apresentação Dinâmica de 2 Pares com Entrada/Saída Lateral
 * 5. Contadores Numéricos Animados (IntersectionObserver)
 * 6. Animações de Scroll Reveal
 * 7. Formulário de Contato e Validação
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. STICKY HEADER & NAVEGAÇÃO
     ========================================================================== */
  const initHeader = () => {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-nav-drawer');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
    const sections = document.querySelectorAll('section[id], header[id]');

    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileToggle.classList.toggle('is-active');
        mobileDrawer.classList.toggle('is-open', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileToggle.classList.remove('is-active');
          mobileDrawer.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    const updateActiveNav = () => {
      const scrollY = window.pageYOffset;
      const headerHeight = (header ? header.offsetHeight : 80) + 60;

      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - headerHeight;
        const sectionId = current.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  };

  /* ==========================================================================
     2. HERO: CARROSSEL CIRCULAR & EFEITO MOUSE TILT
     ========================================================================== */
  const initHeroCircularCarousel = () => {
    const container = document.querySelector('.circular-image-container');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-prev-btn');
    const nextBtn = document.querySelector('.hero-next-btn');

    if (!container || slides.length === 0) return;

    let currentIndex = 0;
    let autoInterval = null;
    const intervalTime = 4800;

    const goToSlide = (index) => {
      slides[currentIndex].classList.remove('is-active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('is-active');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('is-active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('is-active');
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToSlide(idx));
    });

    const startAutoPlay = () => {
      if (prefersReducedMotion) return;
      stopAutoPlay();
      autoInterval = setInterval(nextSlide, intervalTime);
    };

    const stopAutoPlay = () => {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
      }
    };

    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();

    // Tilt suave com o mouse
    if (!prefersReducedMotion) {
      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovered = false;
      let animationFrame = null;

      const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX = ((e.clientX - centerX) / (rect.width / 2)) * 7;
        mouseY = -((e.clientY - centerY) / (rect.height / 2)) * 7;
      };

      const animateTilt = () => {
        if (!isHovered) {
          currentX += (0 - currentX) * 0.1;
          currentY += (0 - currentY) * 0.1;

          if (Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
            container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
            return;
          }
        } else {
          currentX += (mouseX - currentX) * 0.12;
          currentY += (mouseY - currentY) * 0.12;
        }

        container.style.transform = `perspective(1000px) rotateX(${currentY.toFixed(2)}deg) rotateY(${currentX.toFixed(2)}deg) scale(1.02)`;
        animationFrame = requestAnimationFrame(animateTilt);
      };

      container.addEventListener('mouseenter', () => {
        isHovered = true;
        if (!animationFrame) {
          animationFrame = requestAnimationFrame(animateTilt);
        }
      });

      container.addEventListener('mousemove', onMouseMove);

      container.addEventListener('mouseleave', () => {
        isHovered = false;
        mouseX = 0;
        mouseY = 0;
      });
    }
  };

  /* ==========================================================================
     3. SLIDER DINÂMICO DE PARES (PROJETOS & EQUIPE)
     - Entrada e saída lateral suave
     - Controles e indicadores sincronizados
     ========================================================================== */
  const createDynamicPairSlider = (wrapperSelector, autoSlideInterval = 7000) => {
    const wrapper = document.querySelector(wrapperSelector);
    if (!wrapper) return;

    const slides = wrapper.querySelectorAll('.dynamic-pair-slide');
    const tabs = wrapper.querySelectorAll('.slider-tab-btn');
    const prevBtn = wrapper.querySelector('.slider-prev-btn');
    const nextBtn = wrapper.querySelector('.slider-next-btn');
    const counterEl = wrapper.querySelector('.slider-counter');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let isAnimating = false;
    let autoTimer = null;

    const updateCounter = (index) => {
      if (counterEl) {
        const currentStr = String(index + 1).padStart(2, '0');
        const totalStr = String(slides.length).padStart(2, '0');
        counterEl.textContent = `${currentStr} / ${totalStr}`;
      }
    };

    const goToSlide = (newIndex, direction = null) => {
      if (isAnimating || newIndex === currentIndex) return;
      isAnimating = true;

      const prevIndex = currentIndex;
      currentIndex = (newIndex + slides.length) % slides.length;

      const isNext = direction !== null ? direction === 'next' : currentIndex > prevIndex;

      const currentSlide = slides[prevIndex];
      const incomingSlide = slides[currentIndex];

      tabs.forEach((tab, i) => {
        tab.classList.toggle('is-active', i === currentIndex);
      });
      updateCounter(currentIndex);

      if (prefersReducedMotion) {
        currentSlide.classList.remove('is-active', 'slide-out-left', 'slide-out-right');
        incomingSlide.classList.add('is-active');
        isAnimating = false;
        return;
      }

      // Preparar slide de entrada na posição de partida
      incomingSlide.style.transition = 'none';
      incomingSlide.classList.remove('is-active', 'slide-out-left', 'slide-out-right');
      incomingSlide.style.transform = isNext ? 'translateX(100%)' : 'translateX(-100%)';
      incomingSlide.style.opacity = '0';

      // Forçar reflow do browser
      void incomingSlide.offsetWidth;

      // Reativar transições CSS
      incomingSlide.style.transition = '';
      currentSlide.style.transition = '';

      // Animar transição lateral simultânea
      if (isNext) {
        currentSlide.classList.remove('is-active');
        currentSlide.classList.add('slide-out-left');
      } else {
        currentSlide.classList.remove('is-active');
        currentSlide.classList.add('slide-out-right');
      }

      incomingSlide.style.transform = 'translateX(0)';
      incomingSlide.style.opacity = '1';
      incomingSlide.classList.add('is-active');

      setTimeout(() => {
        currentSlide.classList.remove('slide-out-left', 'slide-out-right');
        currentSlide.style.transform = '';
        currentSlide.style.opacity = '';
        incomingSlide.style.transform = '';
        incomingSlide.style.opacity = '';
        isAnimating = false;
      }, 700);
    };

    const next = () => goToSlide(currentIndex + 1, 'next');
    const prev = () => goToSlide(currentIndex - 1, 'prev');

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        const dir = i > currentIndex ? 'next' : 'prev';
        goToSlide(i, dir);
      });
    });

    const startAutoPlay = () => {
      if (prefersReducedMotion) return;
      stopAutoPlay();
      autoTimer = setInterval(next, autoSlideInterval);
    };

    const stopAutoPlay = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };

    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();

    // Suporte a Touch Swipe
    let touchStartX = 0;
    let touchEndX = 0;

    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) next();
        else prev();
      }
    }, { passive: true });

    updateCounter(0);
  };

  /* ==========================================================================
     4. CONTADORES NUMÉRICOS ANIMADOS (+100, +200)
     ========================================================================== */
  const initCounters = () => {
    const counterElements = document.querySelectorAll('.animate-counter');
    if (counterElements.length === 0) return;

    const animateNumber = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1600;
      const startTime = performance.now();

      const updateCount = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        el.textContent = `${prefix}${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    };

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      counterElements.forEach(el => observer.observe(el));
    } else {
      counterElements.forEach(el => {
        const target = el.getAttribute('data-target');
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = `${prefix}${target}${suffix}`;
      });
    }
  };

  /* ==========================================================================
     5. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right');
    if (revealElements.length === 0) return;

    if (prefersReducedMotion) {
      revealElements.forEach(el => el.classList.add('reveal-visible'));
      return;
    }

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('reveal-visible'));
    }
  };

  /* ==========================================================================
     6. FORMULÁRIO DE ORÇAMENTO
     ========================================================================== */
  const initContactForm = () => {
    const form = document.querySelector('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#formName').value.trim();
      const email = form.querySelector('#formEmail').value.trim();
      const phone = form.querySelector('#formPhone').value.trim();
      const service = form.querySelector('#formService').value;
      const message = form.querySelector('#formMessage').value.trim();

      if (!name || !email || !phone) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const waText = encodeURIComponent(
        `Olá, equipe FEU Engenharia!

` +
        `Gostaria de solicitar um orçamento para o meu projeto.

` +
        `• Nome: ${name}
` +
        `• E-mail: ${email}
` +
        `• Telefone: ${phone}
` +
        `• Área de Interesse: ${service}
` +
        `• Detalhes do Projeto: ${message || 'Gostaria de agendar uma reunião técnica.'}`
      );

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `<span>Processando dados...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = `<span>Abrindo WhatsApp...</span>`;
        window.open(`https://wa.me/5511999999999?text=${waText}`, '_blank');

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          form.reset();
        }, 1500);
      }, 500);
    });
  };

  // Inicializar todos os módulos
  initHeader();
  initHeroCircularCarousel();
  createDynamicPairSlider('#projectsSlider', 7500);
  createDynamicPairSlider('#teamSlider', 8500);
  initCounters();
  initScrollReveal();
  initContactForm();
});