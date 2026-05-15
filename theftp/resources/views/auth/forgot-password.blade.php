<x-layouts.guest>

    <div class="auth-card w-full max-w-md">

        {{-- Logos institucionales --}}
        <div class="auth-logos">
            <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía de Girardot" />
            <span class="divider"></span>
            <img src="{{ asset('images/logo-unipiloto.png') }}" alt="Universidad Piloto" />
        </div>

        {{-- ── PASO 1: Solicitar código ── --}}
        <div id="step-email">

            <h2 class="auth-title">Recuperar contraseña</h2>
            <p class="auth-subtitle">
                Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
            </p>

            <div id="step1-error" class="hidden p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert"></div>
            <div id="step1-success" class="hidden p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert"></div>

            <form id="forgot-form" novalidate class="space-y-6">
                @csrf
                <div class="form-group">
                    <label for="forgot-email" class="font-medium text-sm text-gray-700">Correo electrónico</label>
                    <div class="form-input-icon-wrapper">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </span>
                        <input id="forgot-email" class="form-input" type="email" placeholder="correo@ejemplo.com" required autofocus />
                    </div>
                    <span id="error-forgot-email" class="text-xs text-red-600 hidden"></span>
                </div>

                <button type="submit" id="btn-send-code" class="btn-auth-primary">
                    Enviar código
                </button>

                <p class="auth-bottom-link">
                    ¿Recordaste tu contraseña?
                    <a href="{{ route('login') }}">Volver al inicio de sesión</a>
                </p>
            </form>

        </div>

        {{-- ── PASO 2: Código + nueva contraseña (oculto hasta que se envíe el código) ── --}}
        <div id="step-reset" class="hidden">

            <h2 class="auth-title">Ingresa el código</h2>
            <p class="auth-subtitle" id="step2-subtitle">
                Enviamos un código de 6 dígitos a tu correo. Ingrésalo junto con tu nueva contraseña.
            </p>

            <div id="step2-error" class="hidden p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert"></div>

            <form id="reset-form" novalidate class="space-y-6">
                @csrf

                {{-- Código --}}
                <div class="form-group">
                    <label for="reset-token" class="font-medium text-sm text-gray-700">Código de verificación</label>
                    <div class="form-input-icon-wrapper">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
                        </span>
                        <input id="reset-token" class="form-input" type="text" inputmode="numeric" maxlength="6"
                               placeholder="123456" required autocomplete="one-time-code" />
                    </div>
                    <span id="error-reset-token" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Nueva contraseña --}}
                <div class="form-group">
                    <label for="reset-password" class="font-medium text-sm text-gray-700">Nueva contraseña</label>
                    <div class="form-input-icon-wrapper">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </span>
                        <input id="reset-password" class="form-input" type="password"
                               placeholder="Mínimo 8 caracteres" required />
                    </div>
                    <span id="error-reset-password" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Confirmar contraseña --}}
                <div class="form-group">
                    <label for="reset-password-confirm" class="font-medium text-sm text-gray-700">Confirmar contraseña</label>
                    <div class="form-input-icon-wrapper">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </span>
                        <input id="reset-password-confirm" class="form-input" type="password"
                               placeholder="Repite la contraseña" required />
                    </div>
                    <span id="error-reset-password-confirm" class="text-xs text-red-600 hidden"></span>
                </div>

                <button type="submit" id="btn-reset" class="btn-auth-primary">
                    Cambiar contraseña
                </button>

                <p class="auth-bottom-link text-center">
                    <button type="button" id="btn-resend" class="forgot-password-link">
                        ¿No recibiste el código? Reenviar
                    </button>
                </p>
            </form>

        </div>

    </div>

</x-layouts.guest>
