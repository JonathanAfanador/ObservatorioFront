<x-layouts.guest>
    
    <div class="auth-card w-full max-w-md">

        <div class="auth-logos">
            <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía de Girardot" />
            <span class="divider"></span>
            <img src="{{ asset('images/logo-unipiloto.png') }}" alt="Universidad Piloto" />
        </div>

        <h2 class="auth-title">
            Iniciar sesión
        </h2>
    
        <div id="form-error-message" class="hidden p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert"></div>
        <div id="form-success-message" class="hidden p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert"></div>

        <form id="login-form" novalidate class="space-y-6">
            @csrf

            <div class="form-group">
                <label for="email" class="font-medium text-sm text-gray-700">Correo</label>
                <div class="form-input-icon-wrapper">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </span>
                    <input id="email" class="form-input" type="email" name="email" placeholder="correo@ejemplo.com" required autofocus />
                </div>
                <span id="error-email" class="text-xs text-red-600 hidden"></span>
            </div>

            <div class="form-group">
                <label for="password" class="font-medium text-sm text-gray-700">Contraseña</label>
                <div class="form-input-icon-wrapper">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    </span>
                    <input id="password" class="form-input" type="password" name="password" placeholder="Tu contraseña" required />
                </div>
                <span id="error-password" class="text-xs text-red-600 hidden"></span>
            </div>

            <button type="submit" id="submit-button" class="btn-auth-primary">
                Entrar
            </button>
            
            <p class="auth-bottom-link">
                ¿No tienes cuenta?
                <a href="{{ route('register') }}">
                    Regístrate
                </a>
            </p>
        </form>
    </div>
</x-layouts.guest>