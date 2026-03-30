// dashboard-empresa.js — Entry point
// Importa todos los módulos del dashboard de empresa en orden de dependencia.
// Cada módulo expone sus funciones al scope global (window) para que puedan
// comunicarse entre sí, dado que Vite procesa cada import como ES module scope.

import './modules/empresa/empresa-base.js';      // Utilidades globales: API, notificaciones, confirm
import './modules/empresa/empresa-nav.js';         // Menú lateral y navegación entre vistas
import './modules/empresa/empresa-dashboard.js';   // Vista resumen / panel de control
import './modules/empresa/empresa-conductores.js'; // CRUD de conductores
import './modules/empresa/empresa-licencias.js';   // CRUD de licencias + modal de asignación
import './modules/empresa/empresa-vehiculos.js';   // CRUD de vehículos + modal
import './modules/empresa/empresa-resoluciones.js';// Vista y descarga de resoluciones
import './modules/empresa/empresa-rutas.js';       // CRUD de rutas + modal
import './modules/empresa/empresa-asignaciones.js';// CRUD de asignaciones veh-ruta + modal
import './modules/empresa/empresa-restricciones.js'; // CRUD de tipos de restricción
import './modules/empresa/empresa-informes.js';    // Informes: conductores/licencias, vehículos/rutas
import './modules/empresa/empresa-init.js';        // Inicialización: buildMenu, setupEventListeners, navigateTo