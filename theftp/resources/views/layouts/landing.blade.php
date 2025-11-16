<!DOCTYPE html>
{{-- Añadimos scroll-behavior para los links (ej. #inicio) --}}
<html lang="es" style="scroll-behavior: smooth;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Observatorio de Transporte - Alcaldía de Girardot</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Krona+One&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])

</head>
<body style="overflow-x: hidden;">

</head>
<body style="overflow-x: hidden;">
    @yield('content')

    {{-- Render any pushed scripts from child views --}}
    @stack('scripts')

</body>
</html>
