// Importamos Axios para realizar peticiones HTTP desde el frontend
import axios from 'axios';

// Hacemos que Axios esté disponible de forma global en la ventana del navegador
window.axios = axios;

// Configuración por defecto: todas las peticiones se marcarán como AJAX
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
