// dashboard-secretaria.js — Entry point
// Importa todos los módulos del dashboard de secretaría en orden de dependencia.
// Cada módulo expone sus funciones al scope global (window) para que puedan
// comunicarse entre sí, dado que Vite procesa cada import como ES module scope.

import './modules/secretaria/secretaria-base.js';        // Utilidades globales: API, notificaciones, token
import './modules/secretaria/secretaria-nav.js';          // Menú lateral y navegación entre vistas
import './modules/secretaria/secretaria-resoluciones.js'; // Gestión de resoluciones (listar, subir, descargar)
import './modules/secretaria/secretaria-rutas.js';        // Validación de rutas (aprobar, desaprobar, KML)
import './modules/secretaria/secretaria-empresas.js';     // Reporte de empresas y estadísticas resumen
import './modules/secretaria/secretaria-init.js';         // Inicialización: buildMenu, vista por defecto, eventos