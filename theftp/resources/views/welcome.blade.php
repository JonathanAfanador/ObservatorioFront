{{-- 1. Le decimos que HEREDE de tu plantilla --}}
@extends('layouts.landing')

{{-- 2. Definimos la sección 'content' que tu plantilla espera --}}
@section('content')

    {{-- 3. Ponemos todos nuestros componentes aquí dentro --}}
    <x-landing.header />
    
    <main>
        <x-landing.hero />
        <x-landing.carousel />
        <x-landing.services />
        {{-- <x-landing.map /> --}} {{-- Mapa deshabilitado --}}
        <x-landing.features />
    </main>

    <x-landing.footer />

@endsection