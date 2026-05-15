<section id="servicios" class="section">

  <div class="container">

    <header class="section-head">

      <h2>Servicios</h2>

    </header>



    <div class="service-grid">

      <div class="service-item">

        <h3>Geovisor</h3>

                <a href="{{ route('geovisor_vite.blade') }}"
                   class="service-image-link"
                   aria-label="Ir al Geovisor de rutas y paraderos">
                    <img src="{{ asset('images/map-geo.jpg') }}"
                         alt="Mapa interactivo de rutas y paraderos de Girardot" />
                </a>

        <h4>¡Descubre el mapa de rutas y paraderos!</h4>

        <p>Visualiza recorridos por barrio, paraderos y tramos principales.</p>

      </div>



      <div class="service-item">

        <h3>Aplicación Móvil</h3>

        <a href="{{ asset('downloads/observatorio-transporte.apk') }}"
           class="service-image-link"
           aria-label="Descargar la aplicación móvil Observatorio de Transporte"
           download>
          <img src="{{ asset('images/app-portada.jpg') }}" alt="Aplicación móvil Viaja!" />
        </a>

        <h4>Ingresa a la Aplicación móvil y &ldquo;Viaja!&rdquo;</h4>

        <p>Descárgala y disfruta de sus funcionalidades.</p>

        <div class="btn-row">
          <a href="{{ asset('downloads/observatorio-transporte.apk') }}"
             class="btn btn-primary"
             download
             aria-label="Descargar APK para Android">
             Descarga Android APK  
          </a>
        </div>

      </div>

    </div>

  </div>

</section>