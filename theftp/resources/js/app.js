// Importamos la clase principal de Swiper
import Swiper from 'swiper';
// Importamos los módulos adicionales que vamos a usar
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

// Estilos base de Swiper
import 'swiper/css';
// Estilos para el efecto de desvanecido
import 'swiper/css/effect-fade';
// Estilos para las flechas de navegación
import 'swiper/css/navigation';
// Estilos para la paginación (puntos)
import 'swiper/css/pagination';


// Ejecutar todo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {

  // Crear el carrusel principal con Swiper
  const swiper = new Swiper('.swiper', {
    // Registramos los módulos que se van a usar
    modules: [Autoplay, EffectFade, Navigation, Pagination],
    // Transición entre slides con efecto “fade”
    effect: 'fade',
    fadeEffect: { crossFade: true },
    // Configuración del auto-play
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    // Repetir las diapositivas en bucle
    loop: true,
    // Configuración de los puntos de paginación
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    // Configuración de las flechas de navegación
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  // ======================== RELOJ EN TIEMPO REAL ========================

  // Elemento donde se va a pintar la hora actual
  const timeElement = document.getElementById('current-time');

  // Actualiza el contenido del reloj cada vez que se llama
  function updateClock() {
    if (!timeElement) return;
    const now = new Date();
    let hours = now.getHours();
    const minutesNum = now.getMinutes();
    const secondsNum = now.getSeconds();
    // Aseguramos dos dígitos para minutos y segundos
    const minutes = minutesNum < 10 ? '0' + minutesNum : String(minutesNum);
    const seconds = secondsNum < 10 ? '0' + secondsNum : String(secondsNum);
    const timeString = `${hours}:${minutes}:${seconds}`;
    // Pintamos el resultado en el span
    timeElement.textContent = timeString;
  }

  // Si existe el elemento, iniciamos el reloj y lo actualizamos cada segundo
  if (timeElement) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ======================== MENÚ MÓVIL (OFFCANVAS) ========================

  // Botón que abre el menú
  const toggleBtn = document.getElementById('btn-nav-toggle');
  // Botón que cierra el menú
  const closeBtn = document.getElementById('offcanvas-close');
  // Contenedor del menú lateral
  const navMenu = document.getElementById('offcanvas-nav');
  // Enlaces dentro del menú (para cerrarlo al hacer clic)
  const navLinks = document.querySelectorAll('.offcanvas-link');

  if (toggleBtn && navMenu && closeBtn) {
    // Función reutilizable para abrir/cerrar el menú
    const toggleMenu = (isOpen) => {
      navMenu.classList.toggle('is-active', isOpen);
      toggleBtn.classList.toggle('is-active', isOpen);
      // Actualizamos atributos de accesibilidad
      toggleBtn.setAttribute('aria-expanded', isOpen);
      navMenu.setAttribute('aria-hidden', !isOpen);
      // Enfocamos el botón adecuado según el estado
      if (isOpen) {
        closeBtn.focus();
      } else {
        toggleBtn.focus();
      }
    };
    // Abrir menú
    toggleBtn.addEventListener('click', () => toggleMenu(true));
    // Cerrar menú con la X
    closeBtn.addEventListener('click', () => toggleMenu(false));
    // Cerrar menú al hacer clic en cualquier enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }
  // ======================== CONTROL DE UI SEGÚN SESIÓN ========================

  // Token guardado en el navegador: decide si el usuario está autenticado
  const token = localStorage.getItem('auth_token');

  // Botones / bloques de login y logout (versión escritorio)
  const guestDesktop = document.getElementById('auth-guest-desktop');
  const userDesktop = document.getElementById('auth-user-desktop');
  // Botones / bloques de login y logout (versión móvil)
  const guestMobile = document.getElementById('auth-guest-mobile');
  const userMobile = document.getElementById('auth-user-mobile');

  // Bloques de navegación pública y de administración (desktop)
  const publicNav = document.getElementById('nav-public-links');
  const adminNav = document.getElementById('nav-admin-links');
  const guestProfileNav = document.getElementById('nav-guest-profile');

  // Bloques de navegación pública y de administración (móvil)
  const publicNavMobile = document.getElementById('nav-public-links-mobile');
  const adminNavMobile = document.getElementById('nav-admin-links-mobile');
  const guestProfileMobile = document.getElementById('nav-guest-profile-mobile');

  // Si hay token, interpretamos que el usuario tiene sesión iniciada
  if (token) {
    // Mostrar opciones de usuario y ocultar las de invitado
    guestDesktop?.classList.add('hidden');
    guestMobile?.classList.add('hidden');
    userDesktop?.classList.remove('hidden');
    userMobile?.classList.remove('hidden');

    // Ocultamos los enlaces públicos (ya no tiene sentido mostrarlos todos)
    publicNav?.classList.add('hidden');
    publicNavMobile?.classList.add('hidden');

    // Obtenemos datos básicos del usuario desde el localStorage
    const roleId = parseInt(localStorage.getItem('user_role_id'), 10);
    const userName = localStorage.getItem('user_name') || 'Usuario';
    const userRole = localStorage.getItem('user_role_desc') || 'Rol';

    // Rol 5 = Invitado (solo ve su perfil, no panel de administración)
    if (roleId === 5) {
      // Mostrar sección de perfil de invitado en header y menú móvil
      guestProfileNav?.classList.remove('hidden');
      guestProfileMobile?.classList.remove('hidden');

      // Datos visibles en la versión escritorio
      const btnName = document.getElementById('profile-btn-name');
      const infoName = document.getElementById('profile-info-name');
      const infoRole = document.getElementById('profile-info-role');
      if (btnName) btnName.textContent = userName;
      if (infoName) infoName.textContent = userName;
      if (infoRole) infoRole.textContent = userRole;

      // Datos visibles en la versión móvil
      const mobileName = document.getElementById('profile-info-name-mobile');
      const mobileRole = document.getElementById('profile-info-role-mobile');
      if (mobileName) mobileName.textContent = userName;
      if (mobileRole) mobileRole.textContent = userRole;

      // Comportamiento del dropdown del perfil (escritorio)
      const profileBtn = document.getElementById('profile-toggle-btn');
      const profileDropdown = profileBtn?.closest('.profile-dropdown');
      if (profileBtn && profileDropdown) {
        // Abrir/cerrar menú de perfil
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          profileDropdown.classList.toggle('is-active');
        });
        // Cerrar el dropdown si se hace clic fuera
        document.addEventListener('click', (e) => {
          if (!profileDropdown.contains(e.target)) profileDropdown.classList.remove('is-active');
        });
      }

    } else {
      // Para cualquier otro rol, mostramos el acceso a su panel (dashboard)

      // Intentamos recuperar la ruta del panel desde el storage
      let dashboardPath = localStorage.getItem('user_dashboard_path');

      // Si no hay ruta configurada, se calcula según el rol
      if (!dashboardPath || dashboardPath === '/') {
        switch (roleId) {
          case 1: dashboardPath = '/dashboard/admin'; break;
          case 2: dashboardPath = '/dashboard/secretaria'; break;
          case 3: dashboardPath = '/dashboard/empresa'; break;
          case 4: dashboardPath = '/dashboard/upc'; break;
          case 6: dashboardPath = '/dashboard/admin'; break; // Admin secundario
          default: dashboardPath = '/';
        }
      }

      // Solo mostramos enlaces si hay un panel distinto de la página de inicio
      if (dashboardPath && dashboardPath !== '/') {
        const adminDashLink = document.getElementById('admin-dashboard-link');
        const adminDashLinkMobile = document.getElementById('admin-dashboard-link-mobile');

        // Enlace de escritorio al panel
        if (adminDashLink) {
          adminDashLink.setAttribute('href', dashboardPath);
          adminNav?.classList.remove('hidden');
        }

        // Enlace móvil al panel
        if (adminDashLinkMobile) {
          adminDashLinkMobile.setAttribute('href', dashboardPath);
          adminNavMobile?.classList.remove('hidden');
        }
      }
    }

    // Si existe el tracker de inactividad, se arranca aquí
    if (typeof startInactivityTracker === 'function') {
      startInactivityTracker();
    }

  } else {
    // Vista cuando el usuario NO está logueado

    // Mostrar botones de invitado (login / registro)
    guestDesktop?.classList.remove('hidden');
    guestMobile?.classList.remove('hidden');
    // Ocultar botones de usuario autenticado
    userDesktop?.classList.add('hidden');
    userMobile?.classList.add('hidden');

    // Mostrar navegación pública
    publicNav?.classList.remove('hidden');
    publicNavMobile?.classList.remove('hidden');

    // Ocultar zonas de administración y perfil de invitado
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
}
});

/* |--------------------------------------------------------------------------
| Lógica de Autenticación por API
|--------------------------------------------------------------------------
*/

// Limpia todos los mensajes de error del formulario y restaura los textos de ayuda
function clearErrors() {
  // Oculta todos los spans de error
  document.querySelectorAll('[id^="error-"]').forEach(span => {
    span.classList.add('hidden');
    span.textContent = '';
  });

  // Vuelve a mostrar los textos de ayuda de los campos
  document.querySelectorAll('.form-helper-text').forEach(p => {
    p.classList.remove('hidden');
  });

  // Limpia el mensaje de error general del formulario
  const generalError = document.getElementById('form-error-message');
  if (generalError) {
    generalError.classList.add('hidden');
    generalError.textContent = '';
  }
}

// Referencia al formulario de registro
const registerForm = document.getElementById('register-form');

// Muestra un mensaje de error para un campo específico y oculta su texto de ayuda
function showValidationError(field, message) {
  // Texto de ayuda del campo (debajo del input)
  const helper = document.getElementById(`helper-${field}`);
  if (helper) {
    helper.classList.add('hidden');
  }
  // Span donde se muestra el mensaje de error
  const errorSpan = document.getElementById(`error-${field}`);
  if (errorSpan) {
    errorSpan.textContent = message;
    // Si el mensaje está vacío, se oculta el span; si hay texto, se muestra
    errorSpan.classList.toggle('hidden', !message);
  }
}

// Si el formulario de registro existe en la página, se configura su lógica
if (registerForm) {

  // =========== Reglas dinámicas para el campo NUI según el tipo de documento ===========

  // Select del tipo de identificación y campo de NUI
  const tipoIdentSelect = document.getElementById('tipo_ident_id');
  const nuiInput = document.getElementById('nui');
  const nuiHelper = document.getElementById('helper-nui');
  const nuiError = document.getElementById('error-nui');

  // Valor reservado para “Sin identificación”
  const ID_SIN_IDENTIFICACION = '8';

  // Cambia el comportamiento del campo NUI dependiendo del tipo de documento
  if (tipoIdentSelect && nuiInput) {
    tipoIdentSelect.addEventListener('change', (e) => {
      const selectedValue = e.target.value;

      if (selectedValue === ID_SIN_IDENTIFICACION) {
        // Deshabilitar y limpiar el NUI cuando no se exige documento
        nuiInput.disabled = true;
        nuiInput.value = '';

        // Ocultar texto de ayuda y errores previos
        if (nuiHelper) nuiHelper.classList.add('hidden');
        if (nuiError) nuiError.classList.add('hidden');

        // Borrar cualquier error de validación previo del NUI
        showValidationError('nui', '');

      } else {
        // Volver a habilitar el campo NUI y mostrar texto de ayuda
        nuiInput.disabled = false;
        if (nuiHelper) nuiHelper.classList.remove('hidden');
      }
    });
  }

  // =========== Envío del formulario de registro ===========

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const errorMessageDiv = document.getElementById('form-error-message');
    submitButton.disabled = true;
    submitButton.innerHTML = 'Validando...';
    // Limpia mensajes previos antes de validar
    clearErrors();

    // Tomamos todos los datos del formulario en un objeto plano
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    let isValid = true;

    // 1. Validación de nombres y apellidos
    const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?$/;
    if (!nameRegex.test(data.name.trim())) {
      showValidationError('name', 'Debe ser 1 o 2 nombres, cada uno iniciando con mayúscula (ej. "Juan Pablo").');
      isValid = false;
    }
    if (!nameRegex.test(data.last_name.trim())) {
      showValidationError('last_name', 'Debe ser 1 o 2 apellidos, cada uno iniciando con mayúscula (ej. "Medina Ortíz").');
      isValid = false;
    }

    // 2. Validación del NUI (documento) según tipo de documento seleccionado
    const tipoIdent = data.tipo_ident_id;
    const nui = data.nui;

    // Valor para “Sin identificación” durante el submit
    const ID_SIN_IDENTIFICACION_SUBMIT = '8';

    // Solo validamos el NUI si el tipo de documento sí exige número
    if (tipoIdent !== ID_SIN_IDENTIFICACION_SUBMIT) {

      // Reglas específicas según el tipo de documento
      if (tipoIdent === '1') { // Cédula de ciudadanía
        if (!/^\d{7,10}$/.test(nui)) {
          showValidationError('nui', 'La Cédula de Ciudadanía debe tener entre 7 y 10 dígitos.');
          isValid = false;
        }
      } else if (tipoIdent === '2' || tipoIdent === '7') { // Tarjeta de identidad o PEP
        if (!/^\d{10}$/.test(nui)) {
          showValidationError('nui', 'Este documento debe tener 10 dígitos numéricos.');
          isValid = false;
        }
      } else if (tipoIdent === '3') { // Cédula de extranjería
        if (!/^\d{8,10}$/.test(nui)) {
          showValidationError('nui', 'La Cédula de Extranjería debe tener entre 8 y 10 dígitos.');
          isValid = false;
        }
      } else if (tipoIdent === '5') { // Pasaporte
        if (!/^[A-Za-z0-9]{6,9}$/.test(nui)) {
          showValidationError('nui', 'El Pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.');
          isValid = false;
        }
      } else if (!nui) {
        // Si el tipo de documento exige número y el campo viene vacío
        showValidationError('nui', 'El campo es obligatorio.');
        isValid = false;
      }
    }

    // Comprobamos que al menos se haya elegido un tipo de documento
    if (!tipoIdent) {
      showValidationError('tipo_ident_id', 'Debes seleccionar un tipo de documento.');
      isValid = false;
    }

    // 3. Validación del número de teléfono (10 dígitos)
    if (!/^\d{10}$/.test(data.phone_number)) {
      showValidationError('phone_number', 'El número de teléfono debe tener 10 dígitos.');
      isValid = false;
    }

    // 4. Validación de la contraseña
    const pass = data.password;
    let passwordErrors = [];
    // Longitud mínima
    if (pass.length < 8) passwordErrors.push('mínimo 8 caracteres');

    // Contadores para tipos de caracteres presentes
    let typesCount = 0;
    if (/[A-Z]/.test(pass)) typesCount++;
    if (/[a-z]/.test(pass)) typesCount++;
    if (/\d/.test(pass)) typesCount++;
    if (/[!@#$%^()_+\-=\[\]{}]/.test(pass)) typesCount++;

    // Debe tener al menos 3 de los 4 tipos de caracteres
    if (typesCount < 3) passwordErrors.push('combinar 3 de 4 tipos (mayús, minús, núm, símbolo)');

    // Evitar contraseñas demasiado obvias
    const obvious = ['1234', 'abcd', 'qwerty', 'password', 'admin'];
    if (obvious.some(seq => pass.toLowerCase().includes(seq))) {
      passwordErrors.push('no contener secuencias obvias');
    }

    // Si hay errores acumulados, se muestran en conjunto
    if (passwordErrors.length > 0) {
      showValidationError('password', `La contraseña debe tener ${passwordErrors.join(', ')}.`);
      isValid = false;
    }

    // 5. Confirmación de contraseña
    if (pass !== data.password_confirmation) {
      showValidationError('password_confirmation', 'Las contraseñas no coinciden.');
      isValid = false;
    }

    // Si alguna validación falló, se restaura el botón y no se envía la petición
    if (!isValid) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Registrar';
      return;
    }

    // Si todo está bien, se pasa al envío al backend
    submitButton.innerHTML = 'Registrando...';

    try {
      // Petición al endpoint de registro de la API
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
        // Errores de validación desde el backend (422)
        if (response.status === 422) {
          for (const field in result.errors) {
            // Se reutiliza la función genérica para pintar errores
            showValidationError(field, result.errors[field][0]);
          }
        } else {
          // Otro tipo de error (mensaje general)
          errorMessageDiv.textContent = result.message || 'Ocurrió un error inesperado.';
          errorMessageDiv.classList.remove('hidden');
        }
      } else {
        // Si el registro fue exitoso, redirige al login con un flag en la URL
        window.location.href = '/login?registered=true';
      }

    } catch (error) {
      // Error de red o problema al contactar la API
      errorMessageDiv.textContent = 'Error de conexión. Intenta de nuevo.';
      errorMessageDiv.classList.remove('hidden');
    } finally {
      // Se habilita de nuevo el botón, pase lo que pase
      submitButton.disabled = false;
      submitButton.innerHTML = 'Registrar';
    }
  });
}

// ======================== LOGIN (INICIO DE SESIÓN) ========================

// Referencia al formulario de login
const loginFormEl = document.getElementById('login-form');

if (loginFormEl) {
  const urlParams = new URLSearchParams(window.location.search);

  // Si venimos de un registro exitoso, avisamos al usuario
  if (urlParams.get('registered') === 'true') {
    const successMessage = document.getElementById('form-success-message');
    if (successMessage) {
      successMessage.textContent = '¡Registro exitoso! Por favor, inicia sesión.';
      successMessage.classList.remove('hidden');
    }
  }

  // Mostrar aviso específico cuando la sesión se cierra por inactividad
  if (urlParams.get('status') === 'inactive') {
    const successMessage = document.getElementById('form-success-message');
    if (successMessage) {
      successMessage.textContent = 'Tu sesión se cerró por 10 minutos de inactividad.';
      successMessage.classList.remove('hidden');
      // Ajustamos colores para que parezca un aviso informativo
      successMessage.style.backgroundColor = '#FFFBEB';
      successMessage.style.borderColor = '#FDE68A';
      successMessage.style.color = '#92400E';
    }
  }

  // Lógica de envío del formulario de login
  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const errorMessageDiv = document.getElementById('form-error-message');
    submitButton.disabled = true;
    submitButton.innerHTML = 'Ingresando...';
    // Limpiamos mensajes previos
    clearErrors();

    // Recolectamos datos del formulario
    const formData = new FormData(loginFormEl);
    const data = Object.fromEntries(formData.entries());

    let loginResult;
    let token;

    try {
      // Paso 1: solicitar inicio de sesión a la API
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
        // Si las credenciales no son válidas, mostramos el mensaje
        throw new Error(loginResult.message || 'Credenciales incorrectas.');
      }

      // Guardamos el token en localStorage
      token = loginResult.token;
      localStorage.setItem('auth_token', token);

      // Paso 2: consultar información del usuario (/me)
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

      // Hay APIs que envían los datos en data, otras directamente en el body
      const user = userResult.data ? userResult.data : userResult;

      if (!user || !user.rol_id) {
        console.error("Respuesta de /api/auth/me no válida:", userResult);
        throw new Error('Respuesta de usuario inválida. No se encontró el rol_id.');
      }

      const roleId = parseInt(user.rol_id, 10);

      // Paso 2.5: cargar descripción del rol desde la API de roles
      submitButton.innerHTML = 'Cargando datos...';

      let rolDescripcion = "Invitado"; // Valor por defecto

      // Para el invitado (rol 5) basta con la descripción por defecto
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
          }
        } else if (user.rol && user.rol.descripcion) {
          // Si la info del rol ya venía con /me, la reutilizamos
          rolDescripcion = user.rol.descripcion;
        } else {
          console.error("No se pudo cargar la información del rol desde /api/rol/" + roleId);
        }
      }

      // Definir ruta de panel/dashboard según el rol
      let dashboardPath = '/'; // Para invitados se queda en la home
      switch (roleId) {
        case 1: dashboardPath = '/dashboard/admin'; break;
        case 2: dashboardPath = '/dashboard/secretaria'; break;
        case 3: dashboardPath = '/dashboard/empresa'; break;
        case 4: dashboardPath = '/dashboard/upc'; break;
        // Rol 5 se queda con '/'
      }

      // Guardar información clave en localStorage para reutilizarla en la UI
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_role_id', roleId);
      localStorage.setItem('user_role_desc', rolDescripcion);
      localStorage.setItem('user_dashboard_path', dashboardPath);

      // Después del login, se envía a la página principal
      window.location.href = '/';

    } catch (error) {
      // Si algo falla, limpiamos cualquier resto de sesión e informamos al usuario
      clearAuthStorage();
      errorMessageDiv.textContent = error.message;
      errorMessageDiv.classList.remove('hidden');

      submitButton.disabled = false;
      submitButton.innerHTML = 'Iniciar Sesión';
    }
  });
}

// ======================== LOGOUT (CERRAR SESIÓN MANUAL) ========================

// Borra del localStorage todos los datos relacionados con la sesión
function clearAuthStorage() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_role_id');
  localStorage.removeItem('user_role_desc');
}

// Maneja el clic en los botones de “Cerrar sesión”
async function handleLogout(e) {
  e.preventDefault();

  // Obtenemos el estado actual antes de limpiar nada
  const token = localStorage.getItem('auth_token');
  const roleIdStr = localStorage.getItem('user_role_id');
  const roleId = roleIdStr ? parseInt(roleIdStr, 10) : null;

  // Si hay token, notificamos al backend para invalidarlo
  if (token) {
    try {
      // Intentamos recuperar el token CSRF del meta
      const csrfToken = document.querySelector('meta[name="csrf-token"]')
                          ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                          : null;

      if (!csrfToken) {
        console.warn('Meta CSRF token no encontrado. El logout de API puede fallar.');
      }

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Se envía CSRF solo si existe
          ...(csrfToken && {'X-CSRF-TOKEN': csrfToken})
        }
      });

      if (!response.ok) {
        console.error('La solicitud de logout a la API falló.', response.status, response.statusText);
      } else {
        console.log("Cierre de sesión de API solicitado y completado (200 OK).");
      }

    } catch (error) {
      console.error('Error de red durante el logout en el servidor:', error);
    }
  }

  // Limpia siempre el storage, aunque la API haya fallado
  clearAuthStorage();

  // Actualiza la UI para volver al estado de invitado
  const guestDesktop = document.getElementById('auth-guest-desktop');
  const userDesktop = document.getElementById('auth-user-desktop');
  const guestMobile = document.getElementById('auth-guest-mobile');
  const userMobile = document.getElementById('auth-user-mobile');

  guestDesktop?.classList.remove('hidden');
  guestMobile?.classList.remove('hidden');
  userDesktop?.classList.add('hidden');
  userMobile?.classList.add('hidden');

  // Redirigir a la pantalla de login indicando que se cerró sesión
  window.location.href = '/login?status=logged-out';
}

// Asignamos la función de logout a todos los botones que la usen
document.querySelectorAll('.btn-logout').forEach(button => {
  button.addEventListener('click', handleLogout);
});

/*
|--------------------------------------------------------------------------
| Lógica de Inactividad (Cierre de Sesión Automático)
|--------------------------------------------------------------------------
*/

// Timer global para controlar la inactividad
let inactivityTimer;
// Tiempo máximo sin actividad antes de cerrar sesión (10 minutos)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
// const INACTIVITY_TIMEOUT = 5000; // Descomentar para pruebas rápidas

/**
 * Cierra la sesión automáticamente por inactividad del usuario.
 * Se encarga de invalidar el token en el servidor y limpiar el storage.
 */
async function logoutDueToInactivity() {
  console.log("Cerrando sesión por inactividad...");
  const token = localStorage.getItem('auth_token');

  // Si hay token, avisamos al backend para invalidarlo también
  if (token) {
    try {
      // Leemos el token CSRF del meta
      const csrfToken = document.querySelector('meta[name="csrf-token"]')
                        ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        : null;

      await fetch('/api/auth/logout', {
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
      // Aunque falle, seguimos con el cierre local
    }
  }

  // Limpieza local de la sesión
  clearAuthStorage();
  // Redirigimos al login con un estado especial en la URL
  window.location.href = '/login?status=inactive';
}

/**
 * Reinicia el temporizador de inactividad.
 * Se llama cada vez que se detecta actividad del usuario.
 */
function resetInactivityTimer() {
  // Cancelamos el temporizador anterior, si existía
  clearTimeout(inactivityTimer);

  // Iniciamos un nuevo temporizador
  inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
}

// Eventos del navegador que cuentan como actividad del usuario
const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];

/**
 * Arranca el sistema que vigila la inactividad del usuario.
 * Debe llamarse sólo cuando el usuario está autenticado.
 */
function startInactivityTracker() {
  // Cada vez que ocurra uno de estos eventos, se reinicia el contador
  activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
  });

  console.log(`Iniciando seguimiento de inactividad (${INACTIVITY_TIMEOUT / 1000}s).`);
  // Se arranca el timer inicial
  resetInactivityTimer();
}
