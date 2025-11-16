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

  // --- Lógica del Header (Estado de Login) (Sigue igual) ---
  const token = localStorage.getItem('auth_token');
  const guestDesktop = document.getElementById('auth-guest-desktop');
  const userDesktop = document.getElementById('auth-user-desktop');
  const guestMobile = document.getElementById('auth-guest-mobile');
  const userMobile = document.getElementById('auth-user-mobile');

  if (token) {
      guestDesktop?.classList.add('hidden');
      guestMobile?.classList.add('hidden');
      userDesktop?.classList.remove('hidden');
      userMobile?.classList.remove('hidden');
  } else {
      guestDesktop?.classList.remove('hidden');
      guestMobile?.classList.remove('hidden');
      userDesktop?.classList.add('hidden');
      userMobile?.classList.add('hidden');
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
        errorSpan.classList.remove('hidden');
    }
}

if (registerForm) {
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

        // 1. Nombres y Apellidos
        const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?$/;
        if (!nameRegex.test(data.name.trim())) {
            showValidationError('name', 'Debe ser 1 o 2 nombres, cada uno iniciando con mayúscula (ej. "Juan Pablo").');
            isValid = false;
        }
        if (!nameRegex.test(data.last_name.trim())) {
            showValidationError('last_name', 'Debe ser 1 o 2 apellidos, cada uno iniciando con mayúscula (ej. "Medina Ortíz").');
            isValid = false;
        }
        
        // 2. NUI (Documento) - Dinámico
        const tipoIdent = data.tipo_ident_id;
        const nui = data.nui;
        // Asumiendo 1: Cédula, 2: T.I., 3: C.E. (basado en el select)
        if (tipoIdent === '1') { // Cédula Ciudadanía
            }
        } else if (tipoIdent === '5') { // Pasaporte
            if (!/^[A-Za-z0-9]{6,9}$/.test(nui)) {
                showValidationError('nui', 'El Pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.');
                isValid = false;
            }
        } else if (!nui) {
            showValidationError('nui', 'El campo es obligatorio.');
            isValid = false;
        } else if (!tipoIdent) {
            showValidationError('tipo_ident_id', 'Debes seleccionar un tipo de documento.');
            isValid = false;
        }

        // 3. Teléfono (10 dígitos)
        if (!/^\d{10}$/.test(data.phone_number)) {
            showValidationError('phone_number', 'El número de teléfono debe tener 10 dígitos.');
            isValid = false;
        }

        // 4. Contraseña
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

        // 5. Confirmación de Contraseña
        if (pass !== data.password_confirmation) {
            showValidationError('password_confirmation', 'Las contraseñas no coinciden.');
            isValid = false;
        }

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

// --- FUNCIÓN PARA EL LOGIN (Sigue igual) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        const successMessage = document.getElementById('form-success-message');
        if(successMessage) {
            successMessage.textContent = '¡Registro exitoso! Por favor, inicia sesión.';
            successMessage.classList.remove('hidden');
        }
    }
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = document.getElementById('submit-button');
        const errorMessageDiv = document.getElementById('form-error-message');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Ingresando...';
        clearErrors(); // ¡Llamamos a la versión actualizada!

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/auth/login', {
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
                errorMessageDiv.textContent = result.message || 'Credenciales incorrectas.';
                errorMessageDiv.classList.remove('hidden');
            } else {
                localStorage.setItem('auth_token', result.token);
                window.location.href = '/'; 
            }

        } catch (error) {
            errorMessageDiv.textContent = 'Error de conexión. Intenta de nuevo.';
            errorMessageDiv.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Iniciar Sesión';
        }
    });
}

// --- FUNCIÓN PARA EL LOGOUT (Sigue igual) ---
async function handleLogout(e) {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        const response = await fetch('/api/auth/logout', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Fallo al cerrar sesión en el servidor');
        }
        
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
    }
}

document.querySelectorAll('.btn-logout').forEach(button => {
    button.addEventListener('click', handleLogout);
});