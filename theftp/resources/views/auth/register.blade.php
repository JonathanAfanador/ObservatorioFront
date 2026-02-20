<x-layouts.guest>

    {{-- Contenedor principal del formulario de registro --}}
    <div class="auth-card w-full max-w-3xl">

        {{-- Encabezado con los logos institucionales --}}
        <div class="auth-logos">
            <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía de Girardot" />
            <span class="divider"></span>
            <img src="{{ asset('images/logo-unipiloto.png') }}" alt="Universidad Piloto" />
        </div>

        {{-- Título de la vista --}}
        <h2 class="auth-title">
            Registro de usuario
        </h2>

        {{-- Área donde se muestran mensajes de error globales del formulario --}}
        <div id="form-error-message" class="hidden p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert"></div>

        {{-- Formulario de registro --}}
        <form id="register-form" novalidate>
            @csrf

            {{-- Grid de dos columnas para organizar los campos --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">

                {{-- Campo: nombres --}}
                <div class="form-group">
                    <label for="name" class="font-medium text-sm text-gray-700">Nombres</label>
                    <input id="name" class="form-input" type="text" name="name" required />
                    <p class="form-helper-text" id="helper-name">
                        Ej: Juan Pablo. Máx. 2 nombres, inician con mayúscula.
                    </p>
                    <span id="error-name" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Campo: apellidos --}}
                <div class="form-group">
                    <label for="last_name" class="font-medium text-sm text-gray-700">Apellidos</label>
                    <input id="last_name" class="form-input" type="text" name="last_name" required />
                    <p class="form-helper-text" id="helper-last_name">
                        Ej: Medina Ortíz. Máx. 2 apellidos, inician con mayúscula.
                    </p>
                    <span id="error-last_name" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Selección del tipo de documento --}}
                <div class="form-group">
                    <label for="tipo_ident_id" class="font-medium text-sm text-gray-700">Tipo Identificación</label>
                    <select id="tipo_ident_id" name="tipo_ident_id" class="form-select" required>
                        <option value="" disabled selected>Seleccione una opción...</option>
                        @foreach ($tipos_ident as $tipo)
                            <option value="{{ $tipo->id }}">{{ $tipo->descripcion }}</option>
                        @endforeach
                    </select>
                    <span id="error-tipo_ident_id" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Número del documento --}}
                <div class="form-group">
                    <label for="nui" class="font-medium text-sm text-gray-700">Número Ident.</label>
                    <input id="nui" class="form-input" type="text" name="nui" required />
                    <p class="form-helper-text" id="helper-nui">
                        La longitud depende del tipo de documento (ej. C.C. 7-10 dígitos).
                    </p>
                    <span id="error-nui" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Género --}}
                <div class="form-group">
                    <label for="gender" class="font-medium text-sm text-gray-700">Género</label>
                    <select id="gender" name="gender" class="form-select" required>
                        <option value="" disabled selected>Seleccione una opción...</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                    </select>
                    <span id="error-gender" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Número de teléfono --}}
                <div class="form-group">
                    <label for="phone_number" class="font-medium text-sm text-gray-700">Teléfono</label>
                    <input id="phone_number" class="form-input" type="tel" name="phone_number" required />
                    <p class="form-helper-text" id="helper-phone_number">
                        Debe tener 10 dígitos. Ej: 3101234567
                    </p>
                    <span id="error-phone_number" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Correo electrónico (toma toda la fila en pantallas grandes) --}}
                <div class="form-group md:col-span-2">
                    <label for="email" class="font-medium text-sm text-gray-700">Correo</label>
                    <input id="email" class="form-input" type="email" name="email" required />
                    <span id="error-email" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Contraseña --}}
                <div class="form-group">
                    <label for="password" class="font-medium text-sm text-gray-700">Contraseña</label>
                    <input id="password" class="form-input" type="password" name="password" required />
                    <p class="form-helper-text" id="helper-password">
                        Mín. 8 caracteres, 3/4 tipos (Mayús, minús, núm, símbolo).
                    </p>
                    <span id="error-password" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Confirmación de contraseña --}}
                <div class="form-group">
                    <label for="password_confirmation" class="font-medium text-sm text-gray-700">Confirmar Contraseña</label>
                    <input id="password_confirmation" class="form-input" type="password" name="password_confirmation" required />
                    <span id="error-password_confirmation" class="text-xs text-red-600 hidden"></span>
                </div>

                {{-- Botón de envío del formulario --}}
                <div class="md:col-span-2 mt-4">
                    <button type="submit" id="submit-button" class="btn-auth-primary">
                        Crear cuenta
                    </button>
                </div>

                {{-- Link inferior para usuarios que ya tienen cuenta --}}
                <div class="md:col-span-2">
                    <p class="auth-bottom-link">
                        ¿Ya tienes cuenta?
                        <a href="{{ route('login') }}">
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </div>

        </form>
    </div>
</x-layouts.guest>
