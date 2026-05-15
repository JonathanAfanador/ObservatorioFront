// ============================================================
// app-login.js
// Formulario de inicio de sesión: autenticación por API,
// manejo de token, consulta de rol y redirección.
// ============================================================
import { clearErrors, clearAuthStorage } from './app-auth-utils.js';

const loginFormEl = document.getElementById('login-form');

if (loginFormEl) {
    const urlParams = new URLSearchParams(window.location.search);

    // Aviso de registro exitoso
    if (urlParams.get('registered') === 'true') {
        const successMessage = document.getElementById('form-success-message');
        if (successMessage) {
            successMessage.textContent = '¡Registro exitoso! Por favor, inicia sesión.';
            successMessage.classList.remove('hidden');
        }
    }

    // Aviso de sesión cerrada por inactividad
    if (urlParams.get('status') === 'inactive') {
        const successMessage = document.getElementById('form-success-message');
        if (successMessage) {
            successMessage.textContent = 'Tu sesión se cerró por 10 minutos de inactividad.';
            successMessage.classList.remove('hidden');
            successMessage.style.backgroundColor = '#FFFBEB';
            successMessage.style.borderColor = '#FDE68A';
            successMessage.style.color = '#92400E';
        }
    }

    // Aviso de contraseña restablecida exitosamente
    if (urlParams.get('status') === 'password_reset') {
        const successMessage = document.getElementById('form-success-message');
        if (successMessage) {
            successMessage.textContent = '✓ Contraseña actualizada correctamente. Ya puedes iniciar sesión.';
            successMessage.classList.remove('hidden');
        }
    }

    // =========== Envío del formulario de login ===========
    loginFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = document.getElementById('submit-button');
        const errorMessageDiv = document.getElementById('form-error-message');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Ingresando...';
        clearErrors();

        const formData = new FormData(loginFormEl);
        const data = Object.fromEntries(formData.entries());

        try {
            // Paso 1: Protección CSRF de Sanctum (SPA Auth)
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin'
            });

            // Paso 1.5: Login
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': data._token
                },
                credentials: 'same-origin',
                body: JSON.stringify(data)
            });

            const loginResult = await loginResponse.json();
            if (!loginResponse.ok) throw new Error(loginResult.message || 'Credenciales incorrectas.');

            // El token ahora viaja en la cookie HttpOnly llamada laravel_session.
            // Opcional: limpiar tokens de prueba locales viejos.
            sessionStorage.removeItem('auth_token');

            // Paso 2: Obtener datos del usuario
            submitButton.innerHTML = 'Verificando rol...';
            const meResponse = await fetch('/api/auth/me', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin'
            });
            if (!meResponse.ok) throw new Error('No se pudo verificar la sesión de usuario.');

            const userResult = await meResponse.json();
            const user = userResult.data ? userResult.data : userResult;

            if (!user || !user.rol_id) {
                console.error('Respuesta de /api/auth/me no válida:', userResult);
                throw new Error('Respuesta de usuario inválida. No se encontró el rol_id.');
            }

            const roleId = parseInt(user.rol_id, 10);

            // Paso 2.5: Obtener descripción del rol
            submitButton.innerHTML = 'Cargando datos...';
            let rolDescripcion = 'Invitado';

            if (roleId !== 5) {
                const rolResponse = await fetch(`/api/rol/${roleId}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin'
                });

                if (rolResponse.ok) {
                    const rolResult = await rolResponse.json();
                    const rol = rolResult.data ? rolResult.data : rolResult;
                    if (rol && rol.descripcion) {
                        rolDescripcion = rol.descripcion;
                    } else {
                        console.error('Respuesta de /api/rol/{id} no válida:', rolResult);
                    }
                } else if (user.rol && user.rol.descripcion) {
                    rolDescripcion = user.rol.descripcion;
                } else {
                    console.error('No se pudo cargar la información del rol desde /api/rol/' + roleId);
                }
            }

            // Calcular ruta del dashboard según rol
            let dashboardPath = '/';
            switch (roleId) {
                case 1: dashboardPath = '/dashboard/admin'; break;
                case 2: dashboardPath = '/dashboard/secretaria'; break;
                case 3: dashboardPath = '/dashboard/empresa'; break;
                case 4: dashboardPath = '/dashboard/upc'; break;
                // Rol 5 permanece en '/'
            }

            // Persistir datos en sessionStorage
            sessionStorage.setItem('user_name', user.name);
            sessionStorage.setItem('user_role_id', roleId);
            sessionStorage.setItem('user_role_desc', rolDescripcion);
            sessionStorage.setItem('user_dashboard_path', dashboardPath);

            if (user.empresa_id) {
                sessionStorage.setItem('user_empresa_id', user.empresa_id);
                console.log('Empresa vinculada ID:', user.empresa_id);
            } else {
                sessionStorage.removeItem('user_empresa_id');
            }

            if (user.rol && user.rol.permisos) {
                sessionStorage.setItem('user_permissions', JSON.stringify(user.rol.permisos));
                console.log('Permisos cargados en sesión');
            }

            // Redirigir a la página principal tras login exitoso
            window.location.href = '/';

        } catch (error) {
            clearAuthStorage();
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('hidden');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Iniciar Sesión';
        }
    });
}
