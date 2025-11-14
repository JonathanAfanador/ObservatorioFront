// 1. IMPORTAR SWIPER (JS)
import Swiper from 'swiper';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'; // <-- ¡AQUÍ ESTÁ EL ARREGLO!

// 2. IMPORTAR SWIPER (CSS)
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

  // 3. INICIALIZAMOS SWIPER
  const swiper = new Swiper('.swiper', {
    // Le decimos a Swiper qué módulos usar
    modules: [Autoplay, EffectFade, Navigation, Pagination], // <-- ¡TAMBIÉN AQUÍ!
    
    // Configuración
    effect: 'fade', // Efecto de fundido
    fadeEffect: { crossFade: true },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    loop: true,

    // Controles
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  // --- Lógica del Reloj (Sigue igual) ---
  const timeElement = document.getElementById('current-time');
  function updateClock() {
    if (!timeElement) return;
    const now = new Date();
    let hours = now.getHours();
    const minutesNum = now.getMinutes();
    const secondsNum = now.getSeconds();
    const minutes = minutesNum < 10 ? '0' + minutesNum : String(minutesNum);
    const seconds = secondsNum < 10 ? '0' + secondsNum : String(secondsNum);
    const timeString = `${hours}:${minutes}:${seconds}`;
    timeElement.textContent = timeString;
  }
  if (timeElement) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  
  // --- Lógica del Menú Móvil (Sigue igual) ---
  const toggleBtn = document.getElementById('btn-nav-toggle');
  const closeBtn = document.getElementById('offcanvas-close');
  const navMenu = document.getElementById('offcanvas-nav');
  const navLinks = document.querySelectorAll('.offcanvas-link');

  if (toggleBtn && navMenu && closeBtn) {
    const toggleMenu = (isOpen) => {
      navMenu.classList.toggle('is-active', isOpen);
      toggleBtn.classList.toggle('is-active', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen);
      navMenu.setAttribute('aria-hidden', !isOpen);
      if (isOpen) {
        closeBtn.focus();
      } else {
        toggleBtn.focus();
      }
    };
    toggleBtn.addEventListener('click', () => toggleMenu(true));
    closeBtn.addEventListener('click', () => toggleMenu(false));
    navLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }
});