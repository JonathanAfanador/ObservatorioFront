// 1. IMPORTAR SWIPER (JS)
import Swiper from 'swiper';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

// 2. IMPORTAR SWIPER (CSS)
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

  // 3. INICIALIZAMOS SWIPER
  const swiper = new Swiper('.swiper', {
    modules: [Autoplay, EffectFade, Navigation, Pagination],
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    loop: true,
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
const token = localStorage.getItem('auth_token');

// Elementos de Botones (Login/Logout)
const guestDesktop = document.getElementById('auth-guest-desktop');
const userDesktop = document.getElementById('auth-user-desktop');
const guestMobile = document.getElementById('auth-guest-mobile');
const userMobile = document.getElementById('auth-user-mobile');

// Elementos de Navegación (Links)
const publicNav = document.getElementById('nav-public-links');
const adminNav = document.getElementById('nav-admin-links');
const guestProfileNav = document.getElementById('nav-guest-profile');

// Links del Menú Móvil
const publicNavMobile = document.getElementById('nav-public-links-mobile');
const adminNavMobile = document.getElementById('nav-admin-links-mobile');
const guestProfileMobile = document.getElementById('nav-guest-profile-mobile');

if (token) {
    // 1. MOSTRAR UI DE USUARIO LOGUEADO
    guestDesktop?.classList.add('hidden');
    guestMobile?.classList.add('hidden');
    userDesktop?.classList.remove('hidden');
    userMobile?.classList.remove('hidden');

    // 2. OCULTAR LINKS PÚBLICOS
    publicNav?.classList.add('hidden');
    publicNavMobile?.classList.add('hidden');

    // 3. DETERMINAR QUÉ MOSTRAR SEGÚN EL ROL
    const roleId = parseInt(localStorage.getItem('user_role_id'), 10);
    const userName = localStorage.getItem('user_name') || 'Usuario';
    const userRole = localStorage.getItem('user_role_desc') || 'Rol';

    // Rol 5 = Invitado (según tu lógica anterior)
    if (roleId === 5) {
        // --- MOSTRAR PERFIL INVITADO ---
        guestProfileNav?.classList.remove('hidden');
        guestProfileMobile?.classList.remove('hidden');
        
        // Llenar datos desktop
        const btnName = document.getElementById('profile-btn-name');
        const infoName = document.getElementById('profile-info-name');
        const infoRole = document.getElementById('profile-info-role');
        if(btnName) btnName.textContent = userName;
        if(infoName) infoName.textContent = userName;
        if(infoRole) infoRole.textContent = userRole;

        // Llenar datos móvil
        const mobileName = document.getElementById('profile-info-name-mobile');
        const mobileRole = document.getElementById('profile-info-role-mobile');
        if(mobileName) mobileName.textContent = userName;
        if(mobileRole) mobileRole.textContent = userRole;

        // Lógica Dropdown Desktop
        const profileBtn = document.getElementById('profile-toggle-btn');
        const profileDropdown = profileBtn?.closest('.profile-dropdown');
        if(profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('is-active');
            });
            document.addEventListener('click', (e) => {
                if (!profileDropdown.contains(e.target)) profileDropdown.classList.remove('is-active');
            });
        }

    } else {
        // --- MOSTRAR BOTÓN "IR A MI PANEL" (Cualquier otro rol) ---
        
        // Intentamos obtener la ruta del storage, si no está, la deducimos
        let dashboardPath = localStorage.getItem('user_dashboard_path');
        
        if (!dashboardPath || dashboardPath === '/') {
            // Lógica de respaldo por si se borró el localStorage
            switch (roleId) {
                case 1: dashboardPath = '/dashboard/admin'; break;
                case 2: dashboardPath = '/dashboard/secretaria'; break;
                case 3: dashboardPath = '/dashboard/empresa'; break;
                case 4: dashboardPath = '/dashboard/upc'; break;
                case 6: dashboardPath = '/dashboard/admin'; break; // Admin secundario
                default: dashboardPath = '/'; 
            }
        }

        // Solo mostramos el botón si hay una ruta válida distinta de home
        if (dashboardPath && dashboardPath !== '/') {
            const adminDashLink = document.getElementById('admin-dashboard-link');
            const adminDashLinkMobile = document.getElementById('admin-dashboard-link-mobile');

            // Desktop
            if (adminDashLink) {
                adminDashLink.setAttribute('href', dashboardPath);
                adminNav?.classList.remove('hidden'); // <--- ESTO HACE QUE APAREZCA
            }
            
            // Móvil
            if (adminDashLinkMobile) {
                adminDashLinkMobile.setAttribute('href', dashboardPath);
                adminNavMobile?.classList.remove('hidden');
            }
        }
    }

    // Iniciar tracker de inactividad
    if (typeof startInactivityTracker === 'function') {
        startInactivityTracker();
    }

} else {
    // --- MODO VISITANTE (NO LOGUEADO) ---
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
/* |--------------------------------------------------------------------------
| Lógica de Autenticación por API
|--------------------------------------------------------------------------
*/

// --- ¡FUNCIÓN ACTUALIZADA! ---
function clearErrors() {
    // 1. Oculta todos los spans de error (rojos)
    document.querySelectorAll('[id^="error-"]').forEach(span => {
        span.classList.add('hidden');
        span.textContent = '';
    });
    
    // 2. MUESTRA todos los párrafos de ayuda (grises)
    document.querySelectorAll('.form-helper-text').forEach(p => {
        p.classList.remove('hidden');
    });

    // 3. Oculta el error general del formulario
    const generalError = document.getElementById('form-error-message');
    if (generalError) {
        generalError.classList.add('hidden');
        generalError.textContent = '';
    }
}

// --- FUNCIÓN PARA EL REGISTRO (¡ACTUALIZADA!) ---
const registerForm = document.getElementById('register-form');

// Función para mostrar un error y ocultar la ayuda
function showValidationError(field, message) {
    // Oculta la ayuda
    const helper = document.getElementById(`helper-${field}`);
    if (helper) {
        helper.classList.add('hidden');
   }
    // Muestra el error
    const errorSpan = document.getElementById(`error-${field}`);
    if (errorSpan) {
        errorSpan.textContent = message;
        // Si el mensaje está vacío, oculta el span, si no, muéstralo
        errorSpan.classList.toggle('hidden', !message); 
    }
}

if (registerForm) {

    // --- ¡NUEVO CÓDIGO! (Parte 1: Reactividad UX) ---
    // Lógica para deshabilitar el campo NUI dinámicamente
    const tipoIdentSelect = document.getElementById('tipo_ident_id');
    const nuiInput = document.getElementById('nui');
    const nuiHelper = document.getElementById('helper-nui');
    const nuiError = document.getElementById('error-nui');

    // !! CORRECCIÓN !! 
    // Basado en tu captura de pantalla, el ID es '8'.
    const ID_SIN_IDENTIFICACION = '8'; 

    if (tipoIdentSelect && nuiInput) {
        tipoIdentSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;

            if (selectedValue === ID_SIN_IDENTIFICACION) {
                // Deshabilita y limpia el campo NUI
                nuiInput.disabled = true;
                nuiInput.value = '';
                
                // Oculta ayuda y errores
                if (nuiHelper) nuiHelper.classList.add('hidden');
                if (nuiError) nuiError.classList.add('hidden');
                
                // Limpia cualquier error de validación previo
                showValidationError('nui', ''); 

            } else {
                // Habilita el campo y muestra la ayuda
                nuiInput.disabled = false;
                if (nuiHelper) nuiHelper.classList.remove('hidden');
            }
        });
    }
    // --- FIN DEL NUEVO CÓDIGO ---


    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const submitButton = document.getElementById('submit-button');
        const errorMessageDiv = document.getElementById('form-error-message');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Validando...';
        clearErrors(); // Restablece el formulario (muestra ayudas, oculta errores)

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());
        
        let isValid = true;

        // 1. Nombres y Apellidos (Sin cambios)
        const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?$/;
        if (!nameRegex.test(data.name.trim())) {
            showValidationError('name', 'Debe ser 1 o 2 nombres, cada uno iniciando con mayúscula (ej. "Juan Pablo").');
            isValid = false;
        }
        if (!nameRegex.test(data.last_name.trim())) {
            showValidationError('last_name', 'Debe ser 1 o 2 apellidos, cada uno iniciando con mayúscula (ej. "Medina Ortíz").');
            isValid = false;
        }
        
        // --- ¡LÓGICA MODIFICADA! (Parte 2: Validación Submit) ---
        // 2. NUI (Documento) - Dinámico
        const tipoIdent = data.tipo_ident_id;
        const nui = data.nui;
        
        // !! CORRECCIÓN !! 
        // Basado en tu captura de pantalla, el ID es '8'.
        const ID_SIN_IDENTIFICACION_SUBMIT = '8';

        // Solo validamos NUI si NO es "Sin Identificación"
        if (tipoIdent !== ID_SIN_IDENTIFICACION_SUBMIT) { 
            
            // Asumiendo 1: Cédula, 2: T.I., 3: C.E. (basado en el select)
            if (tipoIdent === '1') { // Cédula Ciudadanía
                if (!/^\d{7,10}$/.test(nui)) {
                    showValidationError('nui', 'La Cédula de Ciudadanía debe tener entre 7 y 10 dígitos.');
                    isValid = false;
                }
            } else if (tipoIdent === '2' || tipoIdent === '7') { // Tarjeta Identidad o PEP (ambos 10)
                if (!/^\d{10}$/.test(nui)) {
                    showValidationError('nui', 'Este documento debe tener 10 dígitos numéricos.');
                    isValid = false;
                }
            } else if (tipoIdent === '3') { // Cédula Extranjería
                if (!/^\d{8,10}$/.test(nui)) {
                    showValidationError('nui', 'La Cédula de Extranjería debe tener entre 8 y 10 dígitos.');
                    isValid = false;
                }
            } else if (tipoIdent === '5') { // Pasaporte
                if (!/^[A-Za-z0-9]{6,9}$/.test(nui)) {
                    showValidationError('nui', 'El Pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.');
                    isValid = false;
                }
            } else if (!nui) { // <-- Esta es la validación "obligatorio"
                showValidationError('nui', 'El campo es obligatorio.');
                isValid = false;
            }
        
        } // --- FIN DE LA LÓGICA MODIFICADA ---

        // Esta validación (si se seleccionó un tipo) se ejecuta siempre
        if (!tipoIdent) {
            showValidationError('tipo_ident_id', 'Debes seleccionar un tipo de documento.');
            isValid = false;
        }

        // 3. Teléfono (10 dígitos) (Sin cambios)
        if (!/^\d{10}$/.test(data.phone_number)) {
            showValidationError('phone_number', 'El número de teléfono debe tener 10 dígitos.');
            isValid = false;
        }

        // 4. Contraseña (Sin cambios)
        const pass = data.password;
        let passwordErrors = [];
        if (pass.length < 8) passwordErrors.push('mínimo 8 caracteres');
        
        let typesCount = 0;
        if (/[A-Z]/.test(pass)) typesCount++;
        if (/[a-z]/.test(pass)) typesCount++;
        if (/\d/.test(pass)) typesCount++;
        if (/[!@#$%^()_+\-=\[\]{}]/.test(pass)) typesCount++;
        
        if (typesCount < 3) passwordErrors.push('combinar 3 de 4 tipos (mayús, minús, núm, símbolo)');
        
        const obvious = ['1234', 'abcd', 'qwerty', 'password', 'admin'];
        if (obvious.some(seq => pass.toLowerCase().includes(seq))) {
            passwordErrors.push('no contener secuencias obvias');
       }

        if (passwordErrors.length > 0) {
            showValidationError('password', `La contraseña debe tener ${passwordErrors.join(', ')}.`);
            isValid = false;
        }

        // 5. Confirmación de Contraseña (Sin cambios)
        if (pass !== data.password_confirmation) {
            showValidationError('password_confirmation', 'Las contraseñas no coinciden.');
        isValid = false;
        }

        if (!isValid) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Registrar';
            return; // Detiene el envío
        }
        
        submitButton.innerHTML = 'Registrando...';
        
        try {
            // ... (Resto del fetch, sin cambios) ...
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': data._token 
                },
                body: JSON.stringify(data)
          });

            const result = await response.json();

            if (!response.ok) {
              if (response.status === 422) {
                    for (const field in result.errors) {
                        // ¡CAMBIO! Llama a la nueva función
                        showValidationError(field, result.errors[field][0]);
                    }
                } else {
                    errorMessageDiv.textContent = result.message || 'Ocurrió un error inesperado.';
                  errorMessageDiv.classList.remove('hidden');
                }
            } else {
                window.location.href = '/login?registered=true';
            }

        } catch (error) {
            errorMessageDiv.textContent = 'Error de conexión. Intenta de nuevo.';
          errorMessageDiv.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Registrar';
        }
    });
}
// --- FUNCIÓN PARA EL LOGIN (REEMPLAZADA Y CORREGIDA) ---
const loginFormEl = document.getElementById('login-form'); // Renombrada

if (loginFormEl) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        const successMessage = document.getElementById('form-success-message');
        if(successMessage) {
            successMessage.textContent = '¡Registro exitoso! Por favor, inicia sesión.';
            successMessage.classList.remove('hidden');
        }
    }
    //  Manejar ?status=inactive ---
    if (urlParams.get('status') === 'inactive') {
        if(successMessage) {
            // Reutilizamos la caja de "éxito" como un "aviso"
            successMessage.textContent = 'Tu sesión se cerró por 10 minutos de inactividad.';
            successMessage.classList.remove('hidden');
            // Le damos un estilo de "aviso" (amarillo pálido)
            successMessage.style.backgroundColor = '#FFFBEB'; 
            successMessage.style.borderColor = '#FDE68A';
            successMessage.style.color = '#92400E';
        }
    }
    loginFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = document.getElementById('submit-button');
        const errorMessageDiv = document.getElementById('form-error-message');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Ingresando...';
        clearErrors(); 

        const formData = new FormData(loginFormEl);
        const data = Object.fromEntries(formData.entries());

        let loginResult; 
        let token; 

        try {
            // --- PASO 1: Iniciar Sesión ---
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': data._token
                },
                body: JSON.stringify(data)
            });

            loginResult = await loginResponse.json();

          	if (!loginResponse.ok) {
                throw new Error(loginResult.message || 'Credenciales incorrectas.');
            }

            token = loginResult.token; 
            localStorage.setItem('auth_token', token);

            // --- PASO 2: Verificar Rol ---
            submitButton.innerHTML = 'Verificando rol...';

            const meResponse = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!meResponse.ok) {
                throw new Error('No se pudo verificar la sesión de usuario.');
            }

            const userResult = await meResponse.json();

            
            // --- ¡CORRECCIÓN ANTERIOR! ---
            // Comprobamos si userResult.data existe. Si no, usamos userResult.
            const user = userResult.data ? userResult.data : userResult; 

            if (!user || !user.rol_id) { 
                console.error("Respuesta de /api/auth/me no válida:", userResult);
                throw new Error('Respuesta de usuario inválida. No se encontró el rol_id.');
            }
            
            const roleId = parseInt(user.rol_id, 10);
            
            // --- PASO 2.5: Obtener la descripción del ROL ---
            submitButton.innerHTML = 'Cargando datos...';
            
            let rolDescripcion = "Invitado"; // Valor por defecto

            // El rol 5 (Invitado) no necesita esta llamada, ya sabemos la descripción
            if (roleId !== 5) {
                const rolResponse = await fetch(`/api/rol/${roleId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });

                if (rolResponse.ok) {
                    const rolResult = await rolResponse.json();
                    const rol = rolResult.data ? rolResult.data : rolResult; 
                    if (rol && rol.descripcion) {
                        rolDescripcion = rol.descripcion;
                    } else {
                         console.error("Respuesta de /api/rol/{id} no válida:", rolResult);
                         // No lanzamos error, nos quedamos con "Invitado" o un default
                    }
                } else if (user.rol && user.rol.descripcion) {
                     // Fallback por si /me SÍ traía la info
                     rolDescripcion = user.rol.descripcion;
                } else {
                     console.error("No se pudo cargar la información del rol desde /api/rol/" + roleId);
                     // No lanzamos error
                }
            }

// ---  Guardar la ruta del panel ---
            let dashboardPath = '/'; // Default para Invitado (rol 5)
            switch (roleId) {
                // IDs basados en tu código
                case 1: dashboardPath = '/dashboard/admin'; break;
                case 2: dashboardPath = '/dashboard/secretaria'; break;
                case 3: dashboardPath = '/dashboard/empresa'; break;
                case 4: dashboardPath = '/dashboard/upc'; break;
                // case 5 (Invitado) ya está cubierto por el default '/'
            }

            // ---  guarda todo ---
            localStorage.setItem('user_name', user.name);
            localStorage.setItem('user_role_id', roleId);
            localStorage.setItem('user_role_desc', rolDescripcion);
            // ¡Guardamos la ruta del panel!
            localStorage.setItem('user_dashboard_path', dashboardPath); 

            // Redirigir ---
            // ¡TODOS LOS ROLES AHORA VAN A LA HOME!
            window.location.href = '/'; 

        } catch (error) {
            // Limpia el token si cualquier paso falla
            clearAuthStorage(); 
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('hidden');
            
            submitButton.disabled = false;
            submitButton.innerHTML = 'Iniciar Sesión';
        } 
    });
}
// --- FUNCIÓN PARA EL LOGOUT (REEMPLAZADA Y CORREGIDA) ---

// Función utilitaria para limpiar todo el localStorage de sesión
function clearAuthStorage() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role_id');
    localStorage.removeItem('user_role_desc'); // <-- Corregí un typo aquí
}

async function handleLogout(e) {
    e.preventDefault();
    
    // 1. Obtener estado ANTES de hacer nada.
    const token = localStorage.getItem('auth_token');
    const roleIdStr = localStorage.getItem('user_role_id');
    const roleId = roleIdStr ? parseInt(roleIdStr, 10) : null;
    
    // 2. Si hay token, llamar a la API para invalidarlo (PARA TODOS LOS ROLES).
    if (token) {
        try {
            // Busca el CSRF token (tus vistas SÍ lo tienen)
            const csrfToken = document.querySelector('meta[name="csrf-token"]')
                            ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            : null;
            
            if (!csrfToken) {
                // Esta advertencia ya no debería aparecer porque tus vistas están bien
                console.warn('¡Meta-tag CSRF token no encontrado! El logout de API fallará.');
            }

            const response = await fetch('/api/auth/logout', {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    // ¡¡LA CORRECCIÓN CRÍTICA!!
                    ...(csrfToken && {'X-CSRF-TOKEN': csrfToken})
                }
            });

            // 3. Comprobar la respuesta
            if (!response.ok) {
                console.error('La solicitud de logout a la API falló.', response.status, response.statusText);
                // Esto era el 401 que veías. Ahora debería dar 200 OK.
            } else {
                console.log("Cierre de sesión de API solicitado y completado (200 OK).");
            }

        } catch (error) {
            console.error('Error de red during server logout:', error);
        }
    }

    // 4. SIEMPRE limpiar el storage local
    clearAuthStorage();

    // 5. Actualizar la UI manualmente (oculta/muestra botones)
    // (Esto es lo que faltaba para el Invitado)
    const guestDesktop = document.getElementById('auth-guest-desktop');
    const userDesktop = document.getElementById('auth-user-desktop');
    const guestMobile = document.getElementById('auth-guest-mobile');
    const userMobile = document.getElementById('auth-user-mobile');

    guestDesktop?.classList.remove('hidden');
    guestMobile?.classList.remove('hidden');
    userDesktop?.classList.add('hidden');
    userMobile?.classList.add('hidden');

// 6. Redirigir según el rol.

        // Para todos los demás, redirigimos a /login CON EL PARÁMETRO
        window.location.href = '/login?status=logged-out'; 
    }


// Asigna el evento a todos los botones de logout 
// (Tanto en la landing como en los dashboards)
document.querySelectorAll('.btn-logout').forEach(button => {
    button.addEventListener('click', handleLogout);
});

/*
|--------------------------------------------------------------------------
| Lógica de Inactividad (Cierre de Sesión Automático)
|--------------------------------------------------------------------------
*/

let inactivityTimer; // Variable global para el timer
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos en milisegundos
// const INACTIVITY_TIMEOUT = 5000; // (Usa 5 segundos para hacer pruebas rápidas)

/**
 * Cierra la sesión por inactividad.
 * Solo limpia el storage local y redirige.
 */
async function logoutDueToInactivity() { // <-- 1. La hacemos async
    console.log("Cerrando sesión por inactividad...");
    const token = localStorage.getItem('auth_token');

    // --- ¡NUEVO! LLAMAR A LA API PARA INVALIDAR EL TOKEN ---
    if (token) {
        try {
            // Buscamos el token CSRF (necesario para POST en Laravel)
            const csrfToken = document.querySelector('meta[name="csrf-token"]')
                              ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                              : null;

            await fetch('/api/auth/logout', { // <-- 2. Llamamos a la API
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    ...(csrfToken && {'X-CSRF-TOKEN': csrfToken})
                }
            });
            console.log("Sesión de API invalidada por inactividad.");
        } catch (error) {
            console.error('Error al intentar cerrar sesión de API por inactividad:', error);
            // Igual continuamos, la limpieza local es lo más importante
        }
    }

    // 3. Limpiar el storage local
    clearAuthStorage();
    window.location.href = '/login?status=inactive';
}

/**
 * Reinicia el temporizador de inactividad.
 * Se llama cada vez que hay actividad del usuario.
 */
function resetInactivityTimer() {
    // Limpia el timer anterior
    clearTimeout(inactivityTimer);
    
    // Inicia un nuevo timer
    inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
}

// Eventos que cuentan como "actividad"
const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];

/**
 * Inicia el seguimiento de actividad del usuario.
 */
function startInactivityTracker() {
    // Asigna el reseteo a todos los eventos de actividad
    activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
    });
    
    // Inicia el timer por primera vez
    console.log(`Iniciando seguimiento de inactividad (${INACTIVITY_TIMEOUT / 1000}s).`);
    resetInactivityTimer();
}
