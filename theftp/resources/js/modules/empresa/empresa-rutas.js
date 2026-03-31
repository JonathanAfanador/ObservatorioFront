import MapCore from '../../services/MapCore';

let empresaMapCore = null;

async function loadRutas() {
    const container = document.getElementById('empresa-rutas-map-container');
    if (!container) return;

    // Remover estado de carga si existe (limpiar el container HTML)
    container.innerHTML = '<div id="empresa-rutas-map" style="width: 100%; height: 600px; border-radius: 8px; z-index: 1;"></div>';

    // Para evitar conflictos con hojas de estilo, asegurarse de invalidar y limpiar cuando Leaflet se reutiliza.
    if (empresaMapCore) {
        empresaMapCore.map.remove();
        empresaMapCore = null;
    }

    empresaMapCore = new MapCore('empresa-rutas-map', {
        useNativeLayerControl: true, // Deja que el panel interactivo cambie las capas
        onFeatureClick: (name, props, sourceName) => {
            // Un popup nativo o una notificación visual
            if (window.showNotification) {
                window.showNotification('info', name, `Elemento de: ${sourceName}`);
            }
        }
    });

    // Filtro ELIMINADO: TenantScope ahora protege automáticamente la ruta a nivel de Backend.
    // Al llamar a /rutas, el servidor detecta quién es el usuario y le devuelve
    // únicamente las rutas asignadas a su empresa en la tabla pivote, y traemos los 'paraderos' de BD.
    const endpoint = '/rutas?include=empresas,paraderos'; 

    try {
        const response = await apiGet(endpoint);
        const rutas = typeof normalizeList === 'function' ? normalizeList(response) : (response.data || response);

        empresaMapCore.clearAllOverlays();

        const uniqueRutas = Array.from(new Map(rutas.map(item => [item.id, item])).values());

        if (uniqueRutas.length === 0) {
            if (window.showNotification) window.showNotification('info', 'Rutas', 'No tienes rutas asignadas actualmente.');
            return;
        }

        if (window.showNotification) window.showNotification('success', 'Rutas Encontradas', 'Descargando y decodificando mapas espaciales...', 3000);

        const csrfToken = getCookie('XSRF-TOKEN');
        const fetchOptions = {
            headers: csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {},
            credentials: 'same-origin'
        };

        let index = 0;
        let successCount = 0;

        for (const r of uniqueRutas) {
            // 1. Cargar el trazo (LineString) primario si tiene archivo
            if (r.file_name) {
                const label = r.name || r.nombre || `Ruta ${r.id}`;
                try {
                    await empresaMapCore.loadKmz(`/api/rutas/${r.id}/file`, label, index, fetchOptions);
                    r.status_kml = 'ok';
                    successCount++;
                } catch(e) {
                    console.warn(`[Visor Rutas] No se pudo cargar Trazado KMZ para "${label}":`, e.message);
                    r.status_kml = 'error';
                }
            } else {
                r.status_kml = 'empty';
            }

            // 2. Inyectar Paraderos directamente desde la Base de Datos usando MapCore
            const dbParaderos = r.paraderos?.data || r.paraderos; // Manejar wrapping de Laravel Resources
            
            if (Array.isArray(dbParaderos) && dbParaderos.length > 0) {
                const puntosGeoJson = {
                    type: "FeatureCollection",
                    features: dbParaderos.map(p => ({
                        type: "Feature",
                        properties: { 
                            name: p.name || `Paradero #${p.id}`,
                            description: p.description || 'Punto de parada oficial'
                        },
                        geometry: { 
                            type: "Point", 
                            coordinates: [parseFloat(p.lng), parseFloat(p.lat)] 
                        }
                    }))
                };
                try {
                    const labelParaderos = `🛑 Paraderos: ${r.nombre || r.name}`;
                    empresaMapCore.addGeoJsonFeature(puntosGeoJson, labelParaderos, index + 100);
                    successCount++; 
                } catch(e) {
                    console.error('[Visor Rutas] Error pintando paraderos:', e);
                }
            }

            index++;
        }

        if (successCount > 0) {
            empresaMapCore.fitAllOverlays();
        } else {
            console.warn('[Visor Rutas] Las rutas encontradas no tienen archivos válidos para trazar en el mapa.');
        }

        // --- RENDERIZAR MÓDULO INFORMATIVO ---
        const resumenContainer = document.getElementById('empresa-rutas-resumen');
        if (resumenContainer) {
            let html = `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1.125rem; font-weight: 600; color: #1e293b;">Líneas Autorizadas (${uniqueRutas.length})</h3>
                    <p style="font-size: 0.875rem; color: #64748b;">Desglose de las rutas de transporte público colectivo que operan bajo el aval de la empresa.</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
            `;
            
            uniqueRutas.forEach(r => {
                const nombre = r.name || r.nombre || `Ruta ${r.id}`;
                const safeNombre = nombre.replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] });
                const estatus = r.status_kml === 'ok' 
                    ? `<span style="display:inline-flex; align-items:center; color:#16a34a; font-size:0.75rem; font-weight:600;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Mapa Cartográfico Activo</span>`
                    : (r.status_kml === 'error' ? `<span style="color:#dc2626; font-size:0.75rem; font-weight:600;">⚠️ Error en archivo geográfico</span>` : `<span style="color:#f59e0b; font-size:0.75rem; font-weight:600;">⏳ Pendiente por Secretaría</span>`);
                
                html += `
                <div class="ruta-asignada-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h4 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0.25rem 0;">${safeNombre}</h4>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 0.5rem; border-radius: 0.5rem;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                    </div>
                    <div style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                        ${estatus}
                    </div>
                </div>`;
            });
            
            html += `</div>`;
            resumenContainer.innerHTML = html;
        }

    } catch (err) {
        console.error('Error cargando supervisor GIS:', err);
        if (window.showNotification) window.showNotification('error', 'Error Geográfico', 'No se pudieron recuperar los trazos de ruta.');
    }
}

// Necesitamos invalidar el tamaño del mapa cuando se mueva la pestaña
// para que Leaflet renderice todos los tiles si estaba "display: none"
const originalShowView = window.showView;
if (typeof window.showView === 'function') {
    window.showView = function(viewId) {
        originalShowView(viewId);
        if (viewId === 'rutas' && empresaMapCore) {
            empresaMapCore.invalidateSize();
        }
    };
}

// Solo exponemos loadRutas y downloadRuta, ¡Ya no hay CRUD!
window.loadRutas = loadRutas;

window.downloadRuta = async function(id) {
    try {
        const csrfToken = window.getCookie ? window.getCookie('XSRF-TOKEN') : null;
        const resp = await fetch(`/api/rutas/${id}/file`, {
            headers: csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {},
            credentials: 'same-origin'
        });
        if (!resp.ok) {
            if(window.showNotification) window.showNotification('error', 'Descarga fallida', 'El archivo original no está disponible.');
            return;
        }
        const blob = await resp.blob();
        let fileName = `Ruta_${id}_Geodata`;
        const cd = resp.headers.get('Content-Disposition');
        if (cd) {
            const match = cd.match(/filename="?([^";]+)"?/);
            if (match) fileName = match[1];
        } else {
            // Adivinar extensión por tipo MIME (usualmente application/vnd.google-earth.kmz o kml)
            fileName += blob.type.includes('kml') ? '.kml' : '.kmz';
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        if(window.showNotification) window.showNotification('error', 'Error Geográfico', 'No se pudo descargar el archivo.');
    }
};