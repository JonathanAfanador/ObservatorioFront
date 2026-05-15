import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import eslint from 'vite-plugin-eslint'


export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/css/geovisor.css',
                'resources/js/geovisor.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',
        origin: 'http://192.168.1.41:5173', // IP del PC → @vite() genera URLs alcanzables por el celular
        cors: true,
        allowedHosts: true,
    },
});
