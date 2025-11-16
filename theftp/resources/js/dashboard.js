document.addEventListener('DOMContentLoaded', () => {

    // --- Cargar datos del usuario en el Header ---
    const userNameDisplay = document.getElementById('user-name-display');
    const userRoleDisplay = document.getElementById('user-role-display');
    const userAvatar = document.getElementById('user-avatar');

    const userName = localStorage.getItem('user_name');
    const userRoleDesc = localStorage.getItem('user_role_desc');

    if (userName && userRoleDesc && userAvatar) {
        userNameDisplay.textContent = userName;
        userRoleDisplay.textContent = userRoleDesc;
        userAvatar.textContent = userName.charAt(0); // Pone la inicial
    } else {
        // Si faltan datos, algo salió mal. Redirige al login.
        // Esto es una segunda capa de seguridad.
        window.location.href = '/login';
    }

    // --- Control del Menú Lateral (Tabs) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.dashboard-view');
    const headerTitle = document.getElementById('header-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const viewName = link.getAttribute('data-view');
            
            // 1. Actualizar título del Header
            headerTitle.textContent = link.querySelector('span').textContent;

            // 2. Ocultar todas las vistas
            views.forEach(view => {
                view.style.display = 'none';
            });

            // 3. Mostrar la vista seleccionada
            const activeView = document.getElementById(`view-${viewName}`);
            if (activeView) {
                activeView.style.display = 'block';
            }

            // 4. Actualizar estado activo del link
            navLinks.forEach(navLink => {
                navLink.classList.remove('is-active');
            });
            link.classList.add('is-active');

            // 5. Actualizar URL (opcional, para bookmarking)
            window.location.hash = viewName;
        });
    });

    // --- Cargar vista desde el Hash de la URL (si existe) ---
    if (window.location.hash) {
        const hashView = window.location.hash.substring(1);
        const linkToClick = document.querySelector(`.nav-link[data-view="${hashView}"]`);
        if (linkToClick) {
            linkToClick.click();
        }
    }

    // --- Botón de Logout ---
    // (Tu app.js ya maneja .btn-logout, pero por si acaso lo ponemos aquí también)
    document.querySelectorAll('.btn-logout').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                await fetch('/api/auth/logout', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });
            } catch (error) {
                console.error('Error during logout:', error);
            } finally {
                // Limpia todo y redirige
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_name');
                localStorage.removeItem('user_role_id');
                localStorage.removeItem('user_role_desc');
                window.location.href = '/login';
            }
        });
    });

});