// dashboard-upc.js — Entry point
// Importa todos los módulos del dashboard UPC en orden de dependencia.
// Cada módulo expone sus funciones al scope global (window) para que puedan
// comunicarse entre sí, dado que Vite procesa cada import como ES module scope.

import './modules/upc/upc-base.js';          // Store global, showNotification, apiGet, createTableFromArray, getDeepValue
import './modules/upc/upc-nav.js';            // buildUpcMenu (menú lateral con 7 secciones)
import './modules/upc/upc-overview.js';       // loadOverview (tarjetas de totales)
import './modules/upc/upc-tablas.js';         // load/render Empresas, Conductores, Vehículos, Rutas, Documentos
import './modules/upc/upc-insights.js';       // Auditoría Inteligente y Alertas de Riesgo
import './modules/upc/upc-estadisticas.js';   // loadEstadisticas (5 gráficos Chart.js)
import './modules/upc/upc-exportacion.js';    // setupUpcListeners, exportToCSV/Excel/PDF, handleExportSummary
import './modules/upc/upc-init.js';           // DOMContentLoaded: navegación, carga inicial, listeners