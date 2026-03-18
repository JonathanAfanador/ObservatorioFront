// ============================================================
// app-register.js
// Formulario de registro: validación client-side y envío a API
// ============================================================
import { clearErrors, showValidationError } from './app-auth-utils.js';

const registerForm = document.getElementById('register-form');

if (registerForm) {

    // =========== Reglas dinámicas para el NUI según tipo de documento ===========
    const tipoIdentSelect = document.getElementById('tipo_ident_id');
    const nuiInput = document.getElementById('nui');
    const nuiHelper = document.getElementById('helper-nui');
    const nuiError = document.getElementById('error-nui');
    const ID_SIN_IDENTIFICACION = '8';

    if (tipoIdentSelect && nuiInput) {
        tipoIdentSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;

            if (selectedValue === ID_SIN_IDENTIFICACION) {
                nuiInput.disabled = true;
                nuiInput.value = '';
                if (nuiHelper) nuiHelper.classList.add('hidden');
                if (nuiError) nuiError.classList.add('hidden');
                showValidationError('nui', '');
            } else {
                nuiInput.disabled = false;
                if (nuiHelper) nuiHelper.classList.remove('hidden');
            }
        });
    }

    // =========== Envío del formulario ===========
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = document.getElementById('submit-button');
        const errorMessageDiv = document.getElementById('form-error-message');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Validando...';
        clearErrors();

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());
        let isValid = true;

        // 1. Nombres y apellidos
        const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?$/;
        if (!nameRegex.test(data.name.trim())) {
            showValidationError('name', 'Debe ser 1 o 2 nombres, cada uno iniciando con mayúscula (ej. "Juan Pablo").');
            isValid = false;
        }
        if (!nameRegex.test(data.last_name.trim())) {
            showValidationError('last_name', 'Debe ser 1 o 2 apellidos, cada uno iniciando con mayúscula (ej. "Medina Ortíz").');
            isValid = false;
        }

        // 2. NUI según tipo de documento
        const tipoIdent = data.tipo_ident_id;
        const nui = data.nui;
        const ID_SIN_IDENTIFICACION_SUBMIT = '8';

        if (tipoIdent !== ID_SIN_IDENTIFICACION_SUBMIT) {
            if (tipoIdent === '1') {
                if (!/^\d{7,10}$/.test(nui)) { showValidationError('nui', 'La Cédula de Ciudadanía debe tener entre 7 y 10 dígitos.'); isValid = false; }
            }
            else if (tipoIdent === '2' || tipoIdent === '7') {
                if (!/^\d{10}$/.test(nui)) { showValidationError('nui', 'Este documento debe tener 10 dígitos numéricos.'); isValid = false; }
            }
            else if (tipoIdent === '3') {
                if (!/^\d{8,10}$/.test(nui)) { showValidationError('nui', 'La Cédula de Extranjería debe tener entre 8 y 10 dígitos.'); isValid = false; }
            }
            else if (tipoIdent === '5') {
                if (!/^[A-Za-z0-9]{6,9}$/.test(nui)) { showValidationError('nui', 'El Pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.'); isValid = false; }
            }
            else if (!nui) {
                showValidationError('nui', 'El campo es obligatorio.'); isValid = false;
            }
        }

        if (!tipoIdent) {
            showValidationError('tipo_ident_id', 'Debes seleccionar un tipo de documento.'); isValid = false;
        }

        // 3. Teléfono
        if (!/^\d{10}$/.test(data.phone_number)) {
            showValidationError('phone_number', 'El número de teléfono debe tener 10 dígitos.'); isValid = false;
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
            showValidationError('password', `La contraseña debe tener ${passwordErrors.join(', ')}.`); isValid = false;
        }

        // 5. Confirmación de contraseña
        if (pass !== data.password_confirmation) {
            showValidationError('password_confirmation', 'Las contraseñas no coinciden.'); isValid = false;
        }

        if (!isValid) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Registrar';
            return;
        }

        submitButton.innerHTML = 'Registrando...';

        try {
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
