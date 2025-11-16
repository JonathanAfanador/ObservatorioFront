<header class="site-header" id="site-header">
    <div class="container">
        
        <div class="brand">
            {{-- Asegúrate de poner estas imágenes en public/images/ --}}
            <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía de Girardot" class="logo" />
            <span class="divider" aria-hidden="true"></span>
            <img src="{{ asset('images/logo-unipiloto.png') }}" alt="Universidad Piloto - SAM" class="logo" />
        </div>

        {{-- Menú Desktop --}}
        <nav class="nav-wrapper-desktop">
            <a href="#inicio">Inicio</a>
            <a href="#roles">Conoce el proyecto</a>
            <a href="#servicios">Servicios</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#contacto">Contacto</a>
        </nav>

        {{-- 
          ¡CAMBIOS AQUÍ! 
          Se añadieron IDs y secciones separadas para invitados y usuarios.
        --}}
        
        <div class="auth-desktop" id="auth-guest-desktop">
            <a href="{{ route('login') }}" class="btn btn-ghost">Iniciar sesión</a>
            <a href="{{ route('register') }}" class="btn btn-primary">Registro</a>
        </div>
        
        <div class="auth-desktop hidden" id="auth-user-desktop">
            <button class="btn-logout btn btn-ghost">Cerrar Sesión</button>
        </div>
        
        {{-- Botón Menú Móvil --}}
        <button class="btn-nav-toggle" id="btn-nav-toggle" aria-label="Abrir menú" aria-expanded="false">
            <div class="btn--bg"></div>
            <div class="icons">
                <svg viewBox="0 0 448 512" class="line" id="btn-icon-line">
                    <path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z" />
                </svg>
                <svg viewBox="0 0 320 512" class="close" id="btn-icon-close">
                    <path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z" />
                </svg>
            </div>
        </button>
    </div>
</header>

{{-- Menú Off-Canvas (Móvil) --}}
<nav class="offcanvas-nav" id="offcanvas-nav" aria-hidden="true">
    <button class="offcanvas-close" id="offcanvas-close" aria-label="Cerrar menú">✕</button>
    <ul>
        <li><span><a href="#inicio" class="offcanvas-link">Inicio</a></span></li>
        <li><span><a href="#roles" class="offcanvas-link">Conoce el proyecto</a></span></li>
        <li><span><a href="#servicios" class="offcanvas-link">Servicios</a></span></li>
        <li><span><a href="#funcionalidades" class="offcanvas-link">Funcionalidades</a></span></li>
        <li><span><a href="#contacto" class="offcanvas-link">Contacto</a></span></li>
        
        {{-- 
          ¡CAMBIOS AQUÍ! 
          Se añadieron IDs y secciones separadas para invitados y usuarios.
        --}}

        <li class="offcanvas-auth" id="auth-guest-mobile">
            <a href="{{ route('login') }}" class="btn btn-ghost">Iniciar sesión</a>
            <a href="{{ route('register') }}" class="btn btn-primary">Registro</a>
        </li>
        
        <li class="offcanvas-auth hidden" id="auth-user-mobile">
            {{-- Usamos un 'width: 100%' para que ocupe el espacio --}}
            <button class="btn-logout btn btn-ghost" style="width: 100%;">Cerrar Sesión</button>
        </li>
    </ul>
</nav>