{{-- 
  Sección: Catálogo de Servicios.
  Bloque estructural que presenta las herramientas principales del sistema 
  (Geovisor y Aplicación Móvil) organizadas en una disposición de cuadrícula.
--}}
<section id="servicios" class="section">

  <div class="container">

    {{-- Encabezado semántico de la sección --}}
    <header class="section-head">
      <h2>Servicios</h2>
    </header>

    {{-- 
      Contenedor de Diseño (Grid).
      Agrupa las tarjetas de servicio permitiendo una distribución 
      responsive del contenido.
    --}}
    <div class="service-grid">

      {{-- 
        Tarjeta de Servicio 1: Geovisor.
        Módulo de acceso a la visualización cartográfica de rutas.
      --}}
      <div class="service-item">

        <h3>Geovisor</h3>

        {{-- 
          Enlace seguro a recurso externo.
          Se implementa rel="noopener" junto con target="_blank" para mitigar 
          vulnerabilidades de seguridad (tabnabbing) al abrir el mapa.
        --}}
        <a href="https://URL_DEL_GEOVISOR" target="_blank" rel="noopener" class="service-image-link">
          <img src="{{ asset('images/map-geo.jpg') }}" alt="Mapa de rutas y paraderos" />
        </a>

        <h4>¡Descubre el mapa de rutas y paraderos!</h4>
        <p>Visualiza recorridos por barrio, paraderos y tramos principales.</p>
      </div>

      {{-- 
        Tarjeta de Servicio 2: Aplicación Móvil.
        Módulo promocional para la descarga e instalación de la app nativa.
      --}}
      <div class="service-item">

        <h3>Aplicación Móvil</h3>

        <a href="#" class="service-image-link">
          <img src="{{ asset('images/app-portada.jpg') }}" alt="Aplicación móvil Viaja!" />
        </a>

        <h4>Ingresa a la Aplicación móvil y “Viaja!”</h4>
        <p>Descárgala y disfruta de sus funcionalidades.</p>

        {{-- 
          Área de Acción (CTA).
          Contenedor para los botones de conversión (descarga/tiendas).
        --}}
        <div class="btn-row">
          <a href="#" class="btn btn-primary">Descargar Android</a>
        </div>

      </div>

    </div>

  </div>

</section>