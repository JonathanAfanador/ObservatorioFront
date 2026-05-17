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
            successMessage.textContent = '✓ Contraseña actualizada correctamente. Ya puedes inicia sesión.';
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
            // ✅ Sin csrf-cookie, sin credentials: 'include'
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const loginResult = await loginResponse.json();
            if (!loginResponse.ok) throw new Error(loginResult.message || 'Credenciales incorrectas.');

            // ✅ Guardar token
            const token = loginResult.token;
            if (!token) throw new Error('No se recibió token.');
            sessionStorage.setItem('auth_token', token);

            // ✅ Usar Bearer en /me
            submitButton.innerHTML = 'Verificando rol...';
            const meResponse = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!meResponse.ok) throw new Error('No se pudo verificar la sesión.');

            const userResult = await meResponse.json();
            const user = userResult.data ? userResult.data : userResult;
            if (!user?.rol_id) throw new Error('Respuesta de usuario inválida.');

            const roleId = parseInt(user.rol_id, 10);

            // ✅ Bearer en /rol
            submitButton.innerHTML = 'Cargando datos...';
            let rolDescripcion = 'Invitado';

            if (roleId !== 5) {
                const rolResponse = await fetch(`/api/rol/${roleId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (rolResponse.ok) {
                    const rolResult = await rolResponse.json();
                    const rol = rolResult.data ?? rolResult;
                    if (rol?.descripcion) rolDescripcion = rol.descripcion;
                } else if (user.rol?.descripcion) {
                    rolDescripcion = user.rol.descripcion;
                }
            }

            let dashboardPath = '/';
            switch (roleId) {
                case 1: dashboardPath = '/dashboard/admin'; break;
                case 2: dashboardPath = '/dashboard/secretaria'; break;
                case 3: dashboardPath = '/dashboard/empresa'; break;
                case 4: dashboardPath = '/dashboard/upc'; break;
            }

            sessionStorage.setItem('user_name', user.name);
            sessionStorage.setItem('user_role_id', roleId);
            sessionStorage.setItem('user_role_desc', rolDescripcion);
            sessionStorage.setItem('user_dashboard_path', dashboardPath);
            sessionStorage.removeItem('user_empresa_id');

            if (user.empresa_id) sessionStorage.setItem('user_empresa_id', user.empresa_id);
            if (user.rol?.permisos) sessionStorage.setItem('user_permissions', JSON.stringify(user.rol.permisos));

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