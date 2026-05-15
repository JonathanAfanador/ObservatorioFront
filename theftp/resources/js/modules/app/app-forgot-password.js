// ============================================================
// app-forgot-password.js
// Flujo de recuperación de contraseña en 2 pasos:
//   Paso 1 — Ingresa email → API envía código de 6 dígitos
//   Paso 2 — Ingresa código + nueva contraseña → API actualiza
// ============================================================

const forgotForm  = document.getElementById('forgot-form');
const resetForm   = document.getElementById('reset-form');

if (!forgotForm) {
    // No estamos en la página de recuperación, no hacer nada
} else {

    // ── Estado compartido entre pasos ──────────────────────
    let userEmail = '';

    // ── Referencias DOM ────────────────────────────────────
    const stepEmail  = document.getElementById('step-email');
    const stepReset  = document.getElementById('step-reset');
    const step1Error   = document.getElementById('step1-error');
    const step1Success = document.getElementById('step1-success');
    const step2Error   = document.getElementById('step2-error');
    const step2Subtitle = document.getElementById('step2-subtitle');
    const btnSendCode  = document.getElementById('btn-send-code');
    const btnReset     = document.getElementById('btn-reset');
    const btnResend    = document.getElementById('btn-resend');

    // ── Helpers ─────────────────────────────────────────────
    const showError   = (el, msg)  => { el.textContent = msg; el.classList.remove('hidden'); };
    const hideElement = (el)       => { el.classList.add('hidden'); el.textContent = ''; };
    const hideFieldError = (id)    => { const el = document.getElementById(id); if (el) { el.textContent = ''; el.classList.add('hidden'); } };

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
    }

    // ── PASO 1: Enviar email ─────────────────────────────────
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        hideElement(step1Error);
        hideElement(step1Success);
        hideFieldError('error-forgot-email');

        const emailInput = document.getElementById('forgot-email');
        const email = emailInput.value.trim().toLowerCase();

        if (!email) {
            showError(document.getElementById('error-forgot-email'), 'Ingresa tu correo electrónico.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            showError(document.getElementById('error-forgot-email'), 'Correo electrónico inválido.');
            return;
        }

        btnSendCode.disabled = true;
        btnSendCode.textContent = 'Enviando...';

        try {
            await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });

            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Accept':        'application/json',
                    'X-CSRF-TOKEN':  getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                showError(step1Error, data.message || 'Error al procesar la solicitud.');
                return;
            }

            // Éxito: Mostrar mensaje genérico o el que viene del backend
            userEmail = email;
            step2Subtitle.textContent =
                `Enviamos un código de 6 dígitos a ${email}. Ingrésalo junto con tu nueva contraseña.`;

            // Pasar al paso 2
            stepEmail.classList.add('hidden');
            stepReset.classList.remove('hidden');

        } catch (err) {
            showError(step1Error, 'No se pudo conectar al servidor. Verifica tu conexión.');
        } finally {
            btnSendCode.disabled = false;
            btnSendCode.textContent = 'Enviar código';
        }
    });

    // ── PASO 2: Cambiar contraseña ───────────────────────────
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        hideElement(step2Error);
        hideFieldError('error-reset-token');
        hideFieldError('error-reset-password');
        hideFieldError('error-reset-password-confirm');

        const token    = document.getElementById('reset-token').value.trim();
        const password = document.getElementById('reset-password').value;
        const confirm  = document.getElementById('reset-password-confirm').value;

        // Validaciones locales
        let valid = true;
        if (!token || token.length !== 6) {
            showError(document.getElementById('error-reset-token'), 'El código debe tener 6 dígitos.');
            valid = false;
        }
        if (!password || password.length < 8) {
            showError(document.getElementById('error-reset-password'), 'La contraseña debe tener al menos 8 caracteres.');
            valid = false;
        }
        if (password !== confirm) {
            showError(document.getElementById('error-reset-password-confirm'), 'Las contraseñas no coinciden.');
            valid = false;
        }
        if (!valid) return;

        btnReset.disabled = true;
        btnReset.textContent = 'Actualizando...';

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    email:                 userEmail,
                    token:                 token,
                    password:              password,
                    password_confirmation: confirm,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showError(step2Error, data.message || 'Error al actualizar la contraseña.');
                return;
            }

            // Éxito → redirigir al login con mensaje
            window.location.href = '/login?status=password_reset';

        } catch (err) {
            showError(step2Error, 'No se pudo conectar al servidor. Verifica tu conexión.');
        } finally {
            btnReset.disabled = false;
            btnReset.textContent = 'Cambiar contraseña';
        }
    });

    // ── Reenviar código ──────────────────────────────────────
    btnResend?.addEventListener('click', () => {
        stepReset.classList.add('hidden');
        stepEmail.classList.remove('hidden');
        hideElement(step1Error);
        hideElement(step1Success);
    });
}
