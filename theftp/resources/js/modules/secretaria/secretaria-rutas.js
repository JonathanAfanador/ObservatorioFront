// ============================================================
// secretaria-rutas.js
// NÚCLEO DE RUTAS GIS: Trazar, Oficializar y Asignar
// ============================================================

import MapCore from '../../services/MapCore';

let secMapCore = null;
let allRutas = [];
let allEmpresas = [];

window.loadRutasParaValidar = async function () {
    const container = document.getElementById('secretaria-rutas-map-container');
    if (!container) return;

    // Inicializar mapa si no existe
    if (!secMapCore) {
        secMapCore = new MapCore('secretaria-rutas-map', {
            useNativeLayerControl: true,
            onFeatureClick: (name, props, sourceName) => {
                if (window.showNotification) {
                    window.showNotification('info', 'Elemento Geográfico', name);
                }
            }
        });
    }

    // Forzar renderizado completo de tiles para evitar "mapa pequeño/recortado"
    setTimeout(() => {
        if (secMapCore && secMapCore.map) {
            secMapCore.map.invalidateSize();
        }
    }, 400);

    // Limpiar mapa
    secMapCore.clearAllOverlays();
    
    // UI Carga de Panel Lateral
    const listContainer = document.getElementById('secretaria-rutas-list');
    listContainer.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">Cargando red cartográfica...</div>';

    try {
        // Cargar RUTAS y EMPRESAS en paralelo
        const [rutasRes, empresasRes] = await Promise.all([
            window.apiGet('/rutas?include=empresas,paraderos'),
            window.apiGet('/empresas?limit=500')
        ]);

        allRutas = typeof window.normalizeList === 'function' ? window.normalizeList(rutasRes) : (rutasRes.data || rutasRes);
        allEmpresas = typeof window.normalizeList === 'function' ? window.normalizeList(empresasRes) : (empresasRes.data || empresasRes);

        // Renderizar lista e inyectar al mapa
        window.filterRutasList('');
        renderEmpresasSelect();

        // Trazar RUTAS (KMZ) en el mapa
        let successCount = 0;
        let indexColor = 0;
        for (const r of allRutas) {
            const validFile = r.file_name && (r.file_name.toLowerCase().endsWith('.kmz') || r.file_name.toLowerCase().endsWith('.kml'));
            if (validFile) {
                const label = `Ruta Asignada: ${r.name}`;
                const fileUrl = r.file_name.startsWith('http') ? r.file_name : window.location.origin + r.file_name;
                
                try {
                    // Usamos el label con el prefijo para que organizeLayerControl funcione
                    await secMapCore.loadKmz(fileUrl, label, indexColor, {}, { onlyLines: true });
                    successCount++;
                } catch (err) {
                    console.error("Fallo trazo KMZ", err);
                }
            }
            indexColor++;
        }

        // Trazar PARADEROS guardados en la BD agrupados por Ruta
        indexColor = 0;
        for (const r of allRutas) {
            if (r.paraderos && r.paraderos.length > 0) {
                const puntosGeoJson = {
                    type: "FeatureCollection",
                    features: r.paraderos.map(p => ({
                        type: "Feature",
                        properties: { 
                            name: p.name || p.nombre || `Paradero #${p.id}`,
                            description: p.description || 'Punto de parada oficial'
                        },
                        geometry: { 
                            type: "Point", 
                            coordinates: [parseFloat(p.lng), parseFloat(p.lat)] 
                        }
                    }))
                };
                try {
                    const labelParaderos = `Paraderos de ruta: ${r.name}`;
                    secMapCore.addGeoJsonFeature(puntosGeoJson, labelParaderos, indexColor + 20); 
                    successCount++; 
                } catch(e) {
                    console.error('[Visor Rutas] Error pintando paraderos:', e);
                }
            }
            indexColor++;
        }
        
        secMapCore.organizeLayerControl({ routesHeader: 'Rutas' });

        if (successCount > 0) {
            secMapCore.fitAllOverlays();
        }

    } catch (e) {
        console.error('Error cargando GIS:', e);
        listContainer.innerHTML = '<div class="p-4 text-center text-red-500 text-sm">Error cargando infraestructura espacial.</div>';
    }
};

window.filterRutasList = function(searchTerm) {
    const listContainer = document.getElementById('secretaria-rutas-list');
    if(!listContainer) return;

    if (!allRutas || allRutas.length === 0) {
        listContainer.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No existen rutas trazadas en el sistema.</div>';
        return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = allRutas.filter(r => r.name.toLowerCase().includes(term));

    let html = '<div class="space-y-4 px-1 pb-10">';
    filtered.forEach(r => {
        let empresaNombre = "Ruta Pública (Sin Empresa)";
        if (r.empresas && r.empresas.length > 0) {
            empresaNombre = r.empresas[0].name || r.empresas[0].nombre;
        } else if (r.empresa_id) {
            const emp = allEmpresas.find(emp => emp.id === r.empresa_id);
            if(emp) empresaNombre = emp.name || emp.nombre;
        }
        
        const paraderosCount = (r.paraderos?.data || r.paraderos || []).length;

        const validKml = r.file_name && (r.file_name.toLowerCase().endsWith('.kmz') || r.file_name.toLowerCase().endsWith('.kml'));
        const isActiva = r.estado !== false; // Por defecto true si es null
        
        // Estilos Premium dinámicos
        const statusBorder = isActiva ? (validKml ? "border-emerald-500" : "border-slate-300") : "border-slate-400 opacity-50";
        const grayscaleClass = isActiva ? "" : "grayscale-[0.8] opacity-75 bg-slate-50";

        const statusIcon = validKml ? 
            `<span class="flex items-center gap-1 text-[10px] font-bold ${isActiva ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'} px-2 py-0.5 rounded-full border">OFICIAL</span>` : 
            '<span class="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">SIN ARCHIVO</span>';
        
        const activeBadge = isActiva ? 
            '<span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>' : 
            '<span class="w-2 h-2 rounded-full bg-slate-400"></span>';

        html += `
            <div class="relative group ${grayscaleClass} border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer" onclick="centrarRutaGis(${r.id})">
                <!-- Barra lateral de estado -->
                <div class="absolute left-0 top-0 bottom-0 w-1.5 ${statusBorder} border-l-4 transition-all"></div>
                
                <div class="p-4 pl-6">
                    <!-- Cabecera Corta -->
                    <div class="flex justify-between items-start mb-1">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                ${activeBadge}
                                <h4 class="text-sm font-extrabold text-slate-900 truncate tracking-tight uppercase">${r.name}</h4>
                            </div>
                            <div class="flex items-center gap-2 mt-0.5">
                                ${statusIcon}
                                <span class="text-[10px] text-slate-500 font-medium uppercase tracking-widest truncate max-w-[150px]">${empresaNombre}</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <!-- Toggle de Estado -->
                            <div class="flex items-center gap-2" title="${isActiva ? 'Desactivar Ruta' : 'Activar Ruta'}">
                                <span class="text-[9px] font-bold ${isActiva ? 'text-indigo-600' : 'text-slate-400'} uppercase tracking-tight">${isActiva ? 'Activa' : 'Inactiva'}</span>
                                <label class="relative inline-flex items-center cursor-pointer" onclick="event.stopPropagation()">
                                    <input type="checkbox" value="" class="sr-only peer" ${isActiva ? 'checked' : ''} onchange="toggleRutaStatus(${r.id}, this.checked)">
                                    <div class="w-7 h-3.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Datos Secuenciales -->
                    <div class="flex items-center gap-4 mt-3 pb-3 border-b border-slate-50">
                        <div class="flex items-center gap-1.5 text-xs text-slate-600">
                            <div class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <div>
                                <span class="block font-bold leading-none">${paraderosCount}</span>
                                <span class="text-[9px] text-slate-400 uppercase tracking-tighter">Paraderos</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botonera Premium (Estilo Empresa) -->
                    <div class="flex gap-2 mt-4">
                        <button class="${isActiva ? 'btn-edit' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} flex-1 text-[11px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm" 
                            ${isActiva ? `onclick="event.stopPropagation(); prepareEditRuta(${r.id})"` : 'disabled'}>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            EDITAR
                        </button>
                        <button class="${isActiva ? 'btn-primary text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} flex-1 text-[11px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm"
                            ${isActiva ? `onclick="event.stopPropagation(); window.manageParaderos(${r.id}, '${r.name}')"` : 'disabled'}>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                            PARADEROS
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    listContainer.innerHTML = html;
};

// --- Centrar en el mapa una ruta ---
window.centrarRutaGis = function(id) {
    if(!secMapCore) return;
    const group = secMapCore.overlayGroups[id.toString()];
    if(group) {
        if(group.getBounds) {
            secMapCore.map.fitBounds(group.getBounds(), { maxZoom: 16 });
            group.eachLayer(l => {
                if(l.openPopup) l.openPopup();
            });
        }
    }
};

// --- Rellenar Select de Empresas en el Modal ---
function renderEmpresasSelect() {
    const select = document.getElementById('ruta-empresas');
    if(!select) return;
    select.innerHTML = '<option value="">Seleccione una empresa...</option>';
    allEmpresas.forEach(emp => {
        select.innerHTML += `<option value="${emp.id}">${emp.name || emp.nombre}</option>`;
    });
}

// --- Enviar Formulario de Nueva / Edición de Ruta ---
document.getElementById('form-secretaria-ruta')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('ruta-id').value;
    const name = document.getElementById('ruta-nombre').value;
    const empresa_id = document.getElementById('ruta-empresas').value;
    const fileInput = document.getElementById('ruta-file');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('empresa_id', empresa_id);
    
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    let url = '/rutas';
    if (id) {
        url = `/rutas/${id}`;
        formData.append('_method', 'PUT'); // Requerido por Laravel para procesar FormData en rutas PUT
    } else {
        if (fileInput.files.length === 0) {
            window.showNotification('error', 'Requerido', 'Debe adjuntar el archivo KMZ para oficializar una nueva ruta.');
            return;
        }
    }

    try {
        const res = await window.apiCall(url, 'POST', formData, true);
        if (res && res.status) {
            window.showNotification('success', 'Éxito', id ? 'Información de ruta actualizada.' : 'Nueva Ruta Oficial cargada con éxito.');
            document.getElementById('modal-secretaria-ruta').style.display = 'none';
            document.getElementById('form-secretaria-ruta').reset();
            
            // Actualización inmediata del estado local para evitar latencia de caché
            if (id) {
                const index = allRutas.findIndex(r => r.id == id);
                if (index !== -1) allRutas[index] = res.data;
            } else {
                allRutas.unshift(res.data);
            }

            // Refrescar mapa y lista sin necesidad de apiGet total (Cache-Busting ya actúa en el fondo)
            window.loadRutasParaValidar(); 
        }
    } catch (err) {
        window.showNotification('error', 'Error Geográfico', err.message);
    }
});

// --- Preparar Edición ---
window.prepareEditRuta = function(id) {
    const r = allRutas.find(x => x.id === id);
    if (!r) return;
    document.getElementById('ruta-id').value = r.id;
    document.getElementById('ruta-nombre').value = r.name;
    
    // Si tiene empresas asignadas, selecciona la primera. Si no, intenta por empresa_id.
    if(r.empresas && r.empresas.length > 0){
        document.getElementById('ruta-empresas').value = r.empresas[0].id;
    } else {
        document.getElementById('ruta-empresas').value = r.empresa_id || '';
    }
    
    document.getElementById('ruta-file').value = ''; // Reset file
    
    document.getElementById('modal-secretaria-ruta').style.display = 'flex';
};

// --- Eliminar Ruta ---
window.eliminarRuta = function(id, name) {
    if(window.showConfirm) {
        window.showConfirm('Confirmar Anulación', `¿Anular y borrar el trazado de la ruta '${name}'?`, async () => {
            const res = await window.apiDelete(`/rutas/${id}`);
            if (res && res.status) {
               window.showNotification('success', 'Anulado', 'La ruta y su trazado han sido eliminados de la red cartográfica.');
               window.loadRutasParaValidar();
            }
        });
    }
};
// ============================================
// GESTION DE PARADEROS (EXTRAER & BULK POST)
// ============================================

window.manageParaderos = function(rutaId, rutaName) {
    document.getElementById('paradero-ruta-id').value = rutaId;
    document.getElementById('paradero-ruta-name').innerText = rutaName;
    document.getElementById('paradero-file').value = '';
    document.getElementById('modal-secretaria-paraderos').style.display = 'flex';
};

document.getElementById('form-secretaria-paraderos')?.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const fileInput = document.getElementById('paradero-file');
    const rutaId = document.getElementById('paradero-ruta-id').value;

    if (fileInput.files.length === 0) {
        return window.showNotification('error', 'Falta Archivo', 'Debes adjuntar el KMZ/KML con los puntos GPS.');
    }

    const file = fileInput.files[0];
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Extrayendo Puntos...';
    btn.disabled = true;

    try {
        // 1. Extraer los puntos en Front-End
        const paraderosExtraidos = await secMapCore.extractParaderosFromKmzFile(file);
        
        if (!paraderosExtraidos || paraderosExtraidos.length === 0) {
            throw new Error("No se detectaron coordenadas tipo Point en el archivo.");
        }

        btn.innerHTML = `Sincronizando ${paraderosExtraidos.length} Puntos...`;

        // 2. Enviar JSON estructurado al nuevo ParaderosController
        const response = await fetch(`/api/rutas/${rutaId}/paraderos/bulk`, {
            method: 'POST',
            headers: window.getAuthHeaders ? window.getAuthHeaders() : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ paraderos: paraderosExtraidos, replace: true })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error en guardado masivo');

        window.showNotification('success', '¡Paraderos Digitalizados!', data.message);
        document.getElementById('modal-secretaria-paraderos').style.display = 'none';

        // Recargar datos y pintar nuevamente
        await window.loadRutasParaValidar();
        const updatedRoute = allRutas.find(r => r.id == rutaId);
        if(updatedRoute) window.centrarRutaGis(rutaId);

    } catch (e) {
        console.error(e);
        window.showNotification('error', 'Fallo Sincronizando Nodos', e.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});
/**
 * Inactiva o activa una ruta
 */
window.toggleRutaStatus = async function(id, isChecked) {
    try {
        const res = await window.apiCall(`/rutas/${id}`, 'PATCH', { estado: isChecked });
        if (res && res.status) {
            // Actualizar localmente la lista para no recargar todo
            const ruta = allRutas.find(r => r.id === id);
            if (ruta) ruta.estado = isChecked;
            
            window.showNotification('info', 'Estado Actualizado', isChecked ? 'La ruta ahora está ACTIVA y visible.' : 'La ruta ha sido INACTIVADA.');
            window.filterRutasList(''); // Re-renderizar con el nuevo estado
        }
    } catch (e) {
        console.error("Error al cambiar estado:", e);
        window.showNotification('error', 'Error', 'No se pudo cambiar el estado de la ruta.');
        window.filterRutasList(''); // Revertir visualmente
    }
}

// Exportar para que MapCore u otros puedan usarlo si es necesario
window.secretariaRutas = {
    toggleRutaStatus
};
