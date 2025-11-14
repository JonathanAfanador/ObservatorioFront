/** @type {import('tailwindcss').Config} */
export default {
    content: [
        // Esto viene de tus líneas @source en app.css
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',

        // ¡NUEVA LÍNEA for tw-elements!
        './node_modules/tw-elements/dist/js/**/*.js'
    ],

    theme: {
        extend: {
            // Esto viene de tu @theme en app.css
            fontFamily: {
                sans: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
            },
        },
    },

    plugins: [
        // ¡NUEVA LÍNEA for tw-elements!
        require('tw-elements/dist/plugin.cjs')
    ],
};