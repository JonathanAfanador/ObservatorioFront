import MapCore from '../../services/MapCore';

let empresaMapCore = null;

async function loadRutas() {
    const container = document.getElementById('empresa-rutas-map-container');
    if (!container) return;

    // Evitar doble ejecución simultánea
    if (window._loadRutasRunning) return;
    window._loadRutasRunning = true;

    // Limpiar el contenedor
    container.innerHTML = '<div id="empresa-rutas-map" style="width: 100%; height: 600px; border-radius: 8px; z-index: 1;"></div>';

    if (empresaMapCore) {
        empresaMapCore.map.remove();
        empresaMapCore = null;
    }

    // Esperar que el contenedor sea visible antes de inicializar Leaflet
    await new Promise(resolve => setTimeout(resolve, 600));

    empresaMapCore = new MapCore('empresa-rutas-map', {
        useNativeLayerControl: true,
        onFeatureClick: (name, props, sourceName) => {
            if (window.showNotification) {
                window.showNotification('info', name, `Elemento de: ${sourceName}`);
            }
        }
    });
// LOG TEMPORAL - DIAGNÓSTICO
console.log('=== MAPA CREADO ===');
console.log('Contenedor visible:', document.getElementById('empresa-rutas-map')?.offsetParent);
console.log('Tamaño del mapa:', empresaMapCore.map.getSize());
console.log('Mapa listo:', empresaMapCore.map._loaded);
    const endpoint = '/rutas?include=empresas,paraderos';

    try {
        const response = await apiGet(endpoint);
        const rutas = typeof normalizeList === 'function' ? normalizeList(response) : (response.data || response);

        empresaMapCore.clearAllOverlays();

        const uniqueRutas = Array.from(new Map(rutas.map(item => [item.id, item])).values());

        if (uniqueRutas.length === 0) {
            if (window.showNotification) window.showNotification('info', 'Rutas', 'No tienes rutas asignadas actualmente.');
            window._loadRutasRunning = false;
            return;
        }

        if (window.showNotification) window.showNotification('success', 'Rutas Encontradas', 'Descargando y decodificando mapas espaciales...', 3000);

        let index = 0;
        let successCount = 0;

        // --- PASO 1: Cargar todos los trazados (Rutas) primero ---
        for (const r of uniqueRutas) {
            if (r.file_name && (r.file_name.toLowerCase().endsWith('.kmz') || r.file_name.toLowerCase().endsWith('.kml'))) {
                const label = `Ruta Asignada: ${r.name || r.nombre || 'Ruta ' + r.id}`;
                
                try {
                    const featureLayer = await empresaMapCore.loadKmz(r.file_name, label, index, {}, { onlyLines: true });
                    console.log('=== KMZ CARGADO ===', label);
                    console.log('featureLayer:', featureLayer);
                    console.log('featureLayer._map:', featureLayer?._map);
                    console.log('Layers dentro del grupo:', featureLayer?._layers);
                    console.log('overlayGroups después:', Object.keys(empresaMapCore.overlayGroups));
                    if (featureLayer && featureLayer._map) {
                        r.status_kml = 'ok';
                        successCount++;
                    } else {
                        r.status_kml = 'empty';
                        // Si el grupo se creó pero sin mapa, limpiarlo de overlayGroups
                        if (empresaMapCore.overlayGroups[label]) {
                            delete empresaMapCore.overlayGroups[label];
                        }
                    }
                } catch(e) {
                    console.warn(`[Visor Rutas] No se pudo cargar Trazado KMZ para "${label}" en ${r.file_name}:`, e.message);
                    r.status_kml = 'error';
                }
            } else {
                r.status_kml = 'empty';
            }
            index++;
        }

        // --- PASO 2: Cargar todos los paraderos después ---
        index = 0;
        for (const r of uniqueRutas) {
            const dbParaderos = r.paraderos?.data || r.paraderos; 
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
                    const labelParaderos = `Paraderos: ${r.nombre || r.name}`;
                    empresaMapCore.addGeoJsonFeature(puntosGeoJson, labelParaderos, index + 20);
                    successCount++; 
                } catch(e) {
                    console.error('[Visor Rutas] Error pintando paraderos:', e);
                }
            }
            index++;
        }

        // --- PASO 3: Organizar visualmente el control de capas ---
        empresaMapCore.organizeLayerControl();

        if (successCount > 0) {
            empresaMapCore.fitAllOverlays();
            setTimeout(() => {
                  empresaMapCore.map.invalidateSize();
        empresaMapCore.fitAllOverlays(); // llamar de nuevo después de invalidar
    }, 300);
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
                const safeNombre = nombre.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
                const isActiva = r.estado !== false;
                
                const cardStyle = isActiva ? "" : "filter: grayscale(1); opacity: 0.7; background-color: #f8fafc; border: 1px solid #e2e8f0;";
                const statusBadge = isActiva ? "" : `<span style="background: #64748b; color: white; font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 4px; display: inline-block;">NO OPERATIVA</span>`;
                
                let estatus = '';
                if (r.status_kml === 'ok') {
                    estatus = `<span style="display:inline-flex; align-items:center; color:#16a34a; font-size:0.75rem; font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Mapa Cartográfico Activo</span>`;
                } else if (r.status_kml === 'error') {
                    estatus = `<span style="display:inline-flex; align-items:center; color:#dc2626; font-size:0.75rem; font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Archivo Inválido</span>`;
                } else {
                    estatus = `<span style="display:inline-flex; align-items:center; color:#f59e0b; font-size:0.75rem; font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Pendiente por Trazado</span>`;
                }
                
                html += `
                <div class="ruta-asignada-card" style="${cardStyle}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            ${statusBadge}
                            <h4 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0.25rem 0;">${safeNombre}</h4>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 0.5rem; border-radius: 0.5rem;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                    </div>
                    <div style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                        ${isActiva ? estatus : '<span style="color:#64748b; font-size:0.75rem; font-weight:600;">Inactivada por Secretaría</span>'}
                    </div>
                </div>`;
            });
            
            html += `</div>`;
            resumenContainer.innerHTML = html;
        }

    } catch (err) {
        console.error('Error cargando supervisor GIS:', err);
        if (window.showNotification) window.showNotification('error', 'Error Geográfico', 'No se pudieron recuperar los trazos de ruta.');
    } finally {
        // Siempre liberar el flag, pase lo que pase
        window._loadRutasRunning = false;
    }
}

// Necesitamos invalidar el tamaño del mapa cuando se mueva la pestaña
// para que Leaflet renderice todos los tiles si estaba "display: none"
const originalShowView = window.showView;
if (typeof window.showView === 'function') {
    window.showView = function(viewId) {
        originalShowView(viewId);
        if (viewId === 'rutas') {
            // Dar tiempo al DOM para mostrar el contenedor antes de inicializar Leaflet
            setTimeout(() => {
                if (empresaMapCore) {
                    empresaMapCore.invalidateSize();
                } else {
                    loadRutas();
                }
            }, 350); // ← esperar la transición CSS
        }
    };
}

// Inicialización: llamar loadRutas si la vista activa al cargar la página es 'rutas',
// o cuando el usuario navega a ella mediante el hash de la URL.
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'rutas') {
        loadRutas();
    }
});

window.addEventListener('hashchange', () => {
    const view = window.location.hash.substring(1);
    if (view === 'rutas' && !empresaMapCore) {
        loadRutas();
    }
});

// Solo exponemos loadRutas y downloadRuta, ¡Ya no hay CRUD!
window.loadRutas = loadRutas;

window.downloadRuta = async function(id) {
    try {
        const resp = await fetch(`/api/rutas/${id}/file`, {
            headers: window.getAuthHeaders ? window.getAuthHeaders() : {}
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