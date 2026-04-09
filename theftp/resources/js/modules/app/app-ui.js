// ============================================================
// app-ui.js
// UI de la página principal: carrusel Swiper, reloj del
// sistema, menú móvil offcanvas y control de interfaz por sesión.
// ============================================================
import Swiper from 'swiper';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

document.addEventListener('DOMContentLoaded', () => {

    // ======================== CARRUSEL SWIPER ========================
    new Swiper('.swiper', {
        modules: [Autoplay, EffectFade, Navigation, Pagination],
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        loop: true,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });

    // ======================== RELOJ DEL SISTEMA ========================
    const timeElement = document.getElementById('current-time');

    function updateClock() {
        if (!timeElement) return;
        const now = new Date();
        const hours = now.getHours();
        const minutesNum = now.getMinutes();
        const secondsNum = now.getSeconds();
        const minutes = minutesNum < 10 ? '0' + minutesNum : String(minutesNum);
        const seconds = secondsNum < 10 ? '0' + secondsNum : String(secondsNum);
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    if (timeElement) {
        updateClock();
        setInterval(updateClock, 1000);
    }

    // ======================== MENÚ MÓVIL (OFFCANVAS) ========================
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
            if (isOpen) { closeBtn.focus(); } else { toggleBtn.focus(); }
        };
        toggleBtn.addEventListener('click', () => toggleMenu(true));
        closeBtn.addEventListener('click', () => toggleMenu(false));
        navLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));
    }

    // ======================== CONTROL DE UI SEGÚN SESIÓN ========================
    const roleIdStr = sessionStorage.getItem('user_role_id');

    const guestDesktop = document.getElementById('auth-guest-desktop');
    const userDesktop = document.getElementById('auth-user-desktop');
    const guestMobile = document.getElementById('auth-guest-mobile');
    const userMobile = document.getElementById('auth-user-mobile');
    const publicNav = document.getElementById('nav-public-links');
    const adminNav = document.getElementById('nav-admin-links');
    const guestProfileNav = document.getElementById('nav-guest-profile');
    const publicNavMobile = document.getElementById('nav-public-links-mobile');
    const adminNavMobile = document.getElementById('nav-admin-links-mobile');
    const guestProfileMobile = document.getElementById('nav-guest-profile-mobile');

    if (roleIdStr) {
        guestDesktop?.classList.add('hidden');
        guestMobile?.classList.add('hidden');
        userDesktop?.classList.remove('hidden');
        userMobile?.classList.remove('hidden');
        publicNav?.classList.add('hidden');
        publicNavMobile?.classList.add('hidden');

        const roleId = parseInt(roleIdStr, 10);
        const userName = sessionStorage.getItem('user_name') || 'Usuario';
        const userRole = sessionStorage.getItem('user_role_desc') || 'Rol';

        if (roleId === 5) {
            // Rol Invitado: muestra perfil pero no panel de admin
            guestProfileNav?.classList.remove('hidden');
            guestProfileMobile?.classList.remove('hidden');

            const btnName = document.getElementById('profile-btn-name');
            const infoName = document.getElementById('profile-info-name');
            const infoRole = document.getElementById('profile-info-role');
            if (btnName) btnName.textContent = userName;
            if (infoName) infoName.textContent = userName;
            if (infoRole) infoRole.textContent = userRole;

            const mobileName = document.getElementById('profile-info-name-mobile');
            const mobileRole = document.getElementById('profile-info-role-mobile');
            if (mobileName) mobileName.textContent = userName;
            if (mobileRole) mobileRole.textContent = userRole;

            // Dropdown del perfil (escritorio)
            const profileBtn = document.getElementById('profile-toggle-btn');
            const profileDropdown = profileBtn?.closest('.profile-dropdown');
            if (profileBtn && profileDropdown) {
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    profileDropdown.classList.toggle('is-active');
                });
                document.addEventListener('click', (e) => {
                    if (!profileDropdown.contains(e.target)) profileDropdown.classList.remove('is-active');
                });
            }

        } else {
            // Roles con panel: calcular ruta del dashboard
            let dashboardPath = sessionStorage.getItem('user_dashboard_path');
            if (!dashboardPath || dashboardPath === '/') {
                switch (roleId) {
                    case 1: dashboardPath = '/dashboard/admin'; break;
                    case 2: dashboardPath = '/dashboard/secretaria'; break;
                    case 3: dashboardPath = '/dashboard/empresa'; break;
                    case 4: dashboardPath = '/dashboard/upc'; break;
                    case 6: dashboardPath = '/dashboard/admin'; break;
                    default: dashboardPath = '/';
                }
            }

            if (dashboardPath && dashboardPath !== '/') {
                const adminDashLink = document.getElementById('admin-dashboard-link');
                const adminDashLinkMobile = document.getElementById('admin-dashboard-link-mobile');

                if (adminDashLink) {
                    adminDashLink.setAttribute('href', dashboardPath);
                    adminNav?.classList.remove('hidden');
                }
                if (adminDashLinkMobile) {
                    adminDashLinkMobile.setAttribute('href', dashboardPath);
                    adminNavMobile?.classList.remove('hidden');
                }
            }
        }

        // Arrancar el tracker de inactividad si está disponible
        if (typeof startInactivityTracker === 'function') {
            startInactivityTracker();
        }

    } else {
        // Sin sesión: mostrar UI pública
        guestDesktop?.classList.remove('hidden');
        guestMobile?.classList.remove('hidden');
        userDesktop?.classList.add('hidden');
        userMobile?.classList.add('hidden');
        publicNav?.classList.remove('hidden');
        publicNavMobile?.classList.remove('hidden');
        adminNav?.classList.add('hidden');
        guestProfileNav?.classList.add('hidden');
        adminNavMobile?.classList.add('hidden');
        guestProfileMobile?.classList.add('hidden');
    }
});
