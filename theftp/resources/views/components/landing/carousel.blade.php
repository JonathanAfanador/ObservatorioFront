@php
// configuración de las diapositivas del carrusel
$slides = [
  [
    'id' => 1,
    'img' => asset('images/girar-2.webp'),
    'title' => 'Bienvenida',
    'text' => 'Te damos la bienvenida al portal de movilidad. Aquí podrás conocer los responsables del proyecto e ingresar a cada módulo.',
    'cta' => 'Explorar servicios',
    'link' => '#servicios',
  ],
  [
    'id' => 2,
    'img' => asset('images/upiloto-sam.jpg'),
    'title' => 'Rol UPC',
    'text' => 'La UPC y SAM acompañan el componente social, la caracterización de usuarios y la articulación con comunidades para mejorar la movilidad.',
    'cta' => 'Ir a UPC',
    'link' => '#',
  ],
  [
    'id' => 3,
    'img' => asset('images/transito-1.jpg'),
    'title' => 'Rol Secretaría',
    'text' => 'La Secretaría de Tránsito administra la información oficial de rutas, paraderos, novedades y reportes de operación del sistema.',
    'cta' => 'Ir a Secretaría',
    'link' => '#',
  ],
  [
    'id' => 4,
    'img' => asset('images/transito-girardot.webp'),
    'title' => 'Rol Empresas',
    'text' => 'Las empresas transportadoras y aliadas actualizan su flota, rutas y horarios, y acceden a tableros de desempeño.',
    'cta' => 'Ir a Empresas',
    'link' => '#',
  ],
];
@endphp

<section id="roles" class="section">
  <div class="container">
    <header class="section-head">
      <h2>Ecosistema del proyecto</h2>
      <p>Desliza para conocer a los encargados y su rol en la plataforma.</p>
    </header>

    <div class="swiper">
      <div class="swiper-wrapper">
        
        @foreach ($slides as $index => $slide)
          <div class="swiper-slide">

            {{-- 
              todo el wrapper es un enlace 
              y hemos quitado el botón de abajo.
            --}}
            <a href="{{ $slide['link'] }}" class="carousel-slide-link" aria-label="Ver {{ $slide['title'] }}">
              <div class="car-slide-wrapper">
                
                {{-- Clase dinámica  --}}
                <div class="car-image-full bg-slide-{{ $loop->index }}"></div>
                
                <div class="car-body-overlay">
                  <h3>{{ $slide['title'] }}</h3>
                  <p>{{ $slide['text'] }}</p>
                  
                </div>
              </div>
            </a>
          </div>
        @endforeach

      </div>
      
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  </div>
</section>


<style>
  @foreach ($slides as $index => $slide)
    .bg-slide-{{ $index }} {
      background-image: url('{{ $slide['img'] }}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  @endforeach
</style>