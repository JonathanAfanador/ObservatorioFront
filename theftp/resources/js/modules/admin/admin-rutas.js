/**
 * ============================================
 * ADMIN RUTAS MODULE (AUDIT VISTA)
 * ============================================
 * Herramienta de supervisión técnica de trazados.
 * La validación legal es competencia de la Secretaría de Tránsito.
 */
const AdminRutas = (function() {
    'use strict';

    let isInitialized = false;
    let rutasList = [];
    let filteredList = [];
    let empresasList = [];
    let editingId = null;

    function init() {
        if (isInitialized) return;

        console.log('🚀 Inicializando AdminRutas...');

        document.getElementById('btn-add-ruta')?.addEventListener('click', () => openModal());
        document.getElementById('form-ruta')?.addEventListener('submit', save);
        document.getElementById('btn-cancel-ruta')?.addEventListener('click', closeModal);
        document.getElementById('toggle-deleted-rutas')?.addEventListener('change', load);

        isInitialized = true;
    }

    async function load() {
        const container = document.getElementById('rutas-table');
        if (!container) return;
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Sincronizando Base de Datos...</p>
            </div>
        `;
        const showDeleted = document.getElementById('toggle-deleted-rutas')?.checked || false;

        const params = {
            limit: 100,
            include: 'empresas,paraderos',
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const res = await AdminBase.apiCall('/rutas', 'GET', params);
        if (res && res.data) {
            rutasList = res.data.data || res.data;
            filteredList = [...rutasList];
            render(filteredList);
        } else {
            container.innerHTML = '<div class="p-8 text-center text-red-500 font-black uppercase tracking-widest text-xs">Error al Cargar Datos de Ruta</div>';
        }
    }

    /**
     * Maneja el buscador local del módulo
     */
    function handleSearch(query) {
        if (!query) {
            filteredList = [...rutasList];
        } else {
            const q = query.toLowerCase();
            filteredList = rutasList.filter(r => {
                const nameMatch = r.name.toLowerCase().includes(q);
                const empresaMatch = r.empresas && r.empresas.some(e => e.name.toLowerCase().includes(q));
                return nameMatch || empresaMatch;
            });
        }
        render(filteredList);
    }

    function render(data) {
        const columns = [
            { 
                header: 'ID', 
                key: 'id',
                render: (r) => `<span class="font-mono text-[10px] font-bold text-slate-400">#${r.id}</span>`
            },
            { 
                header: 'Nombre de Ruta / Trazado', 
                render: (r) => {
                    // Saneamiento de nombre (quitar emojis residuales si existen)
                    const cleanName = r.name.replace('✅', '').replace('[OK]', '').trim();
                    const paraderosCount = r.paraderos ? r.paraderos.length : 0;
                    return `
                        <div class="flex flex-col">
                            <span class="font-black text-slate-800 uppercase tracking-tight text-[11px] leading-tight">${cleanName}</span>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="text-[9px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 italic">
                                   Puntos de Parada: ${paraderosCount}
                                </span>
                            </div>
                        </div>
                    `;
                }
            },
            { 
                header: 'Operadores Autorizados', 
                render: (r) => {
                    if (!r.empresas || r.empresas.length === 0) {
                        return '<span class="text-[10px] text-red-500 italic font-black uppercase tracking-tighter decoration-double underline">Sin Asignación</span>';
                    }
                    
                    return `
                        <div class="flex flex-wrap gap-1 max-w-[200px]">
                            ${r.empresas.map(e => `
                                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black uppercase border border-slate-200 shadow-sm whitespace-nowrap">
                                    ${e.name}
                                </span>
                            `).join('')}
                        </div>
                    `;
                }
            },
            { 
                header: 'Visualización', 
                render: (r) => {
                    if (!r.file_name) return '<span class="text-[10px] text-slate-300 italic uppercase">Sin Trazado Cargado</span>';
                    
                    return `
                        <button onclick="window.open('/geovisor?route_id=${r.id}', '_blank')" 
                           class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm uppercase tracking-widest group">
                            <svg class="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.13a2 2 0 011.106-1.789L9 1m0 19l6-2m-6 2V1m6 17l5.447 2.724A2 2 0 0021 18.87V8.512a2 2 0 00-1.106-1.789L15 4m0 14V4m0 0L9 1"></path></svg>
                            VER MAPA
                        </button>
                    `;
                }
            },
            {
                header: 'Estado de Trazado',
                render: (r) => {
                    if (r.deleted_at) return '<span class="px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border-orange-200 text-[10px] font-black uppercase border shadow-sm opacity-70">Deshabilitada</span>';
                    
                    // CORRECCIÓN: El estado ahora depende de si tiene trazado cargado (file_name)
                    const hasTrace = r.file_name !== null && r.file_name !== '';
                    return hasTrace
                        ? `<span class="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-black uppercase border shadow-sm inline-flex items-center gap-1.5 ring-2 ring-emerald-50/50">
                             VERIFICADA
                           </span>`
                        : `<span class="px-3 py-1 rounded-xl bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-black uppercase border shadow-sm inline-flex items-center gap-1.5">
                             PENDIENTE
                           </span>`;
                }
            },
            { 
                header: 'Acciones', 
                render: (r) => {
                    // El administrador NO valida, solo puede Editar registros básicos o eliminar
                    return AdminBase.generateActionButtons(r, 'AdminRutas');
                }
            }
        ];
        
        // Renderizado de tabla con buscador global oculto (usamos el propio del módulo)
        AdminBase.renderTable(data, columns, 'rutas-table', 10, { hideGlobalSearch: true });
    }

    async function loadEmpresas() {
        if (empresasList.length === 0) {
            const res = await AdminBase.apiCall('/empresas', 'GET', { limit: 1000 });
            if (res && res.data) empresasList = res.data.data || res.data;
        }
    }

    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-ruta');
        const form = document.getElementById('form-ruta');
        const selEmpresa = document.getElementById('ruta-empresa');

        if (!modal) return;

        selEmpresa.innerHTML = '<option italic text-slate-400 uppercase>Cargando Operadores...</option>';
        await loadEmpresas();
        
        selEmpresa.innerHTML = '<option value="">-- Seleccione Empresa Operadora --</option>';
        if (empresasList && empresasList.forEach) {
            empresasList.forEach(e => {
                selEmpresa.innerHTML += `<option value="${e.id}">${e.name} [NIT: ${e.nit || 'S/N'}]</option>`;
            });
        }

        form.reset();
        modal.style.display = 'flex';
        document.getElementById('modal-ruta-title').textContent = id ? 'Editar Registro de Ruta' : 'Nueva Ruta del Sistema';

        if (id) {
            const item = rutasList.find(r => r.id === id);
            if (item) {
                const cleanName = item.name.replace('✅', '').replace('[OK]', '').trim();
                document.getElementById('ruta-name').value = cleanName;
                selEmpresa.value = item.empresas && item.empresas.length > 0 ? item.empresas[0].id : '';
                document.getElementById('ruta-file-help').innerHTML = `<span class="text-slate-500">El trazado cartográfico ya está asociado. Cargue uno nuevo solo para actualizarlo.</span>`;
            }
        } else {
            document.getElementById('ruta-file-help').textContent = "Seleccione archivo de trazado (KMZ / GeoJSON).";
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal-ruta');
        if(modal) modal.style.display = 'none';
        editingId = null;
    }

    async function save(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('ruta-name').value);
        formData.append('empresa_id', document.getElementById('ruta-empresa').value);
        const fileInput = document.getElementById('ruta-file');
        
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        const btnSubmit = document.querySelector('#form-ruta button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        
        if (btnSubmit) { 
            btnSubmit.disabled = true; 
            btnSubmit.innerHTML = `<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>`; 
        }

        try {
            let endpoint = '/rutas';
            if (editingId) endpoint += `/${editingId}`;
            
            const res = await AdminBase.apiCall(endpoint, 'POST', formData);
            if (res && res.status) {
                AdminBase.showNotification('success', 'Éxito', 'Información de ruta actualizada correctamente.');
                closeModal();
                load();
            }
        } catch (err) {
            AdminBase.showNotification('error', 'Error', 'No se pudo procesar la solicitud.');
        } finally {
            if (btnSubmit) { 
                btnSubmit.disabled = false; 
                btnSubmit.textContent = 'Guardar'; 
            }
        }
    }

    async function destroy(id) {
        if (!confirm('¿Desea deshabilitar este registro de ruta?')) return;
        const res = await AdminBase.apiCall(`/rutas/${id}`, 'DELETE');
        if (res) {
            AdminBase.showNotification('success', 'Eliminado', 'La ruta ya no será visible.');
            load();
        }
    }

    async function restore(id) {
        if (!confirm('¿Reactivar este registro?')) return;
        const res = await AdminBase.apiCall(`/rutas/${id}/rehabilitate`, 'POST');
        if (res) {
            AdminBase.showNotification('success', 'Reactivado', 'Ruta habilitada nuevamente.');
            load();
        }
    }

    return { init, load, openModal, destroy, restore, handleSearch };
})();

window.AdminRutas = AdminRutas;