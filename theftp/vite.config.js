import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import eslint from 'vite-plugin-eslint'


export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/css/dashboard.css',
                'resources/js/app.js',
                'resources/js/alert.js',
                'resources/js/dashboard.js',
                'resources/js/dashboard-admin.js',
                'resources/js/modules/admin/admin-base.js',
                'resources/js/modules/admin/admin-empresas.js',
                'resources/js/modules/admin/admin-conductores.js',
                'resources/js/modules/admin/admin-documentos.js',
                'resources/js/modules/admin/admin-vehiculos.js',
                'resources/js/modules/admin/admin-propietarios.js',
                'resources/js/modules/admin/admin-rutas.js',
                'resources/js/modules/admin/admin-licencias.js',
                'resources/js/modules/admin/admin-auditoria.js',
                'resources/js/modules/admin/admin-backups.js',
                'resources/js/dashboard-secretaria.js',
                'resources/js/modules/secretaria/secretaria-base.js',
                'resources/js/modules/secretaria/secretaria-nav.js',
                'resources/js/modules/secretaria/secretaria-empresas.js',
                'resources/js/modules/secretaria/secretaria-rutas.js',
                'resources/js/modules/secretaria/secretaria-licencias.js',
                'resources/js/modules/secretaria/secretaria-vehiculos.js',
                'resources/js/modules/secretaria/secretaria-propietarios.js',
                'resources/js/modules/secretaria/secretaria-resoluciones.js',
                'resources/js/dashboard-empresa.js',
                'resources/js/dashboard-upc.js',
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
