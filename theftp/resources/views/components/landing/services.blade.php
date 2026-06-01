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

        <div class="service-image-link" style="display: flex; justify-content: center; align-items: center; padding: 15px 0;">
          <img src="{{ asset('images/qr_code_apk.png') }}" alt="Código QR para descargar la aplicación móvil" style="max-width: 200px; width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
        </div>

        <h4>Ingresa a la Aplicación móvil y &ldquo;Viaja!&rdquo;</h4>

        <p>Descárgala y disfruta de sus funcionalidades.</p>

        <div class="btn-row">
          <span class="btn btn-primary" style="cursor: default; pointer-events: none; opacity: 0.9; font-weight: bold;">
             Escanea este QR para la app móvil
          </span>
        </div>

      </div>

    </div>

  </div>

</section>