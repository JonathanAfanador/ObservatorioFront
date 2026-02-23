{{-- Indicamos que esta vista utiliza como base la plantilla principal de la landing --}}
@extends('layouts.landing')

{{-- Sección donde colocamos el contenido que será insertado en el layout --}}
@section('content')

    {{-- Encabezado principal de la página (navbar, logo, enlaces, etc.) --}}
    <x-landing.header />

    <main>
        {{-- Banner inicial con el mensaje principal del sitio --}}
        <x-landing.hero />

        {{-- Carrusel de imágenes o contenido destacado --}}
        <x-landing.carousel />

        {{-- Sección donde se describen los servicios principales --}}
        <x-landing.services />

        {{-- Bloque con características, ventajas o información adicional --}}
        <x-landing.features />
    </main>

    {{-- Pie de página global de la landing --}}
    <x-landing.footer />

@endsection
