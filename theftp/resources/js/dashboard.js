 // --- Función utilitaria para limpiar todo el localStorage de sesión ---
function clearAuthStorage() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role_id');
    localStorage.removeItem('user_role_desc');
}

// --- Función de redirección (FORZAR LOGOUT) ---
function forceLogout(message) {
    alert(message);
    clearAuthStorage();
    window.location.href = '/login';
}

// --- Función de redirección a Home (SIN CERRAR SESIÓN) ---
function redirectToHome(message) {
    alert(message);
    window.location.href = '/'; // Redirige a la Home
}

// --- GUARDIÁN DE SEGURIDAD DEL DASHBOARD (ACTUALIZADO) ---
(function() {
    console.log("Ejecutando Guardián de Seguridad del Dashboard...");

    const token = localStorage.getItem('auth_token');
    const roleIdStr = localStorage.getItem('user_role_id');
    const roleDesc = localStorage.getItem('user_role_desc') || "Invitado";
    const currentPath = window.location.pathname;

    // 1. Si no hay token, ¡fuera!
    if (!token || !roleIdStr) {
        forceLogout('Sesión no válida o expirada. Por favor, inicia sesión.');
        return; // Detiene la ejecución
    }

    const roleId = parseInt(roleIdStr, 10);

    // 2. Regla Específica: El rol 5 (Invitado) NUNCA puede estar en un dashboard.
    if (roleId === 5) {
        redirectToHome(`Tu rol de "${roleDesc}" no tiene acceso a los paneles de control.`);
        return;
    }

    // 3. Mapeo de rutas a los roles permitidos
  const rolePaths = {
        '/dashboard/admin': [1,6],
        '/dashboard/secretaria': [1, 6, 2, 7], // Admin y Secretaría
        '/dashboard/empresa': [1, 6, 3, 8],   // Admin y Empresa
        '/dashboard/upc': [1, 6, 4, 9]        // Admin y UPC
    };

    let isAuthorized = false;

    // Busca la ruta actual en nuestro mapa de seguridad
    for (const path in rolePaths) {
        if (currentPath.startsWith(path)) {
            if (rolePaths[path].includes(roleId)) {
                isAuthorized = true;
            }
            break; 
        }
    }

    // 4. Si la ruta NO estaba en el mapa, o si el rol NO estaba en la lista de permitidos
    if (!isAuthorized) {
        redirectToHome(`Tu rol (${roleDesc}) no tiene permisos para acceder a esta página.`);
        return;
    }

    // --- ¡AUTORIZADO! ---
    // Si llegamos aquí, el usuario tiene permiso.
    // Hacemos visible el layout que ocultamos en el HTML.

    console.log(`Acceso concedido para el rol: ${roleDesc}. Mostrando panel.`);
    const layoutWrapper = document.getElementById('dashboard-layout-wrapper');
    if (layoutWrapper) {
        layoutWrapper.style.visibility = 'visible';
    }

})();


// --- LÓGICA DEL PANEL (Se ejecuta después del guardián) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Cargar datos del usuario en el Header ---
    const userName = localStorage.getItem('user_name');
    const userRoleDesc = localStorage.getItem('user_role_desc');
    const userNameDisplay = document.getElementById('user-name-display');
    const userRoleDisplay = document.getElementById('user-role-display');
    const userAvatar = document.getElementById('user-avatar');

    // (La verificación de "if (!userName)" se quita de aquí porque el guardián ya lo hizo)
    if (userName && userRoleDesc && userAvatar) {
        userNameDisplay.textContent = userName;
        userRoleDisplay.textContent = userRoleDesc;
        userAvatar.textContent = userName.charAt(0);
    }

    // --- Control del Menú Lateral (Tabs) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.dashboard-view');
    const headerTitle = document.getElementById('header-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            if (headerTitle) {
                headerTitle.textContent = link.querySelector('span').textContent;
        }
            views.forEach(view => {
                view.style.display = 'none';
            });
            const activeView = document.getElementById(`view-${viewName}`);
            if (activeView) {
                activeView.style.display = 'block';
            }
            navLinks.forEach(navLink => {
                navLink.classList.remove('is-active');
            });
            link.classList.add('is-active');
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
    } else {
        // Activa el primer link por defecto si no hay hash
        const firstLink = document.querySelector('.nav-link');
        if (firstLink) {
            firstLink.click();
        }
    }

    // --- Botón de Logout (Esta lógica es para el Dashboard) ---
    document.querySelectorAll('.btn-logout').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('auth_token');
            /*
            const roleIdStr = localStorage.getItem('user_role_id');
            const roleId = roleIdStr ? parseInt(roleIdStr, 10) : null;
            
            // --- ¡ESTO SE DEBE ELIMINAR! ---
            // (el guardián ya lo bloqueó, pero es una doble-verificación)
            if (roleId === 5) {
                clearAuthStorage();
                window.location.href = '/login'; 
                return;
            }
            */
            
            if (token) {
                             try {
                                await fetch('/api/auth/logout', {
                                    method: 'POST', 
                                    headers: {
                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                        'Authorization': `Bearer ${token}`,
                                        'Accept': 'application/json',
                                    }
                                });
                                console.log("Cierre de sesión de API solicitado desde Dashboard.");
                            } catch (error) {
                                console.error('Error during server logout:', error);
                            }
                        }
            
            // Siempre limpia y redirige a login
           clearAuthStorage();
            window.location.href = '/login';
        });
    });
});