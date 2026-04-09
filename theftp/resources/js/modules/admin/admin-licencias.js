/**
 * ============================================
 * ADMIN LICENCIAS MODULE
 * ============================================
 */
const AdminLicencias = (function() {
    'use strict';

    let isInitialized = false;
    let licenciasList = [];
    let categoriasList = [];
    let restriccionesList = [];
    let documentosList = [];
    let editingId = null;

    function init() {
        if (isInitialized) return;

        document.getElementById('btn-add-licencia')?.addEventListener('click', () => openModal());
        document.getElementById('form-licencia')?.addEventListener('submit', save);
        document.getElementById('btn-cancel-licencia')?.addEventListener('click', closeModal);
        document.getElementById('toggle-deleted-licencias')?.addEventListener('change', load);

        isInitialized = true;
    }

    async function load() {
        const container = document.getElementById('licencias-table');
        if (!container) return;
        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando licencias...</div>';
        
        const showDeleted = document.getElementById('toggle-deleted-licencias')?.checked || false;
        const params = {
            limit: 100,
            include: 'categoria,restriccion,documento,conductores.persona', // Nombres de las relaciones en el modelo
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const res = await AdminBase.apiCall('/licencias', 'GET', params);
        if (res && res.data) {
            licenciasList = res.data.data || res.data;
            render(licenciasList);
        }
    }

    function render(data) {
        const columns = [
            { 
                header: 'ID', 
                key: 'id', 
                render: (r) => `<span class="font-mono text-[10px] text-gray-400">#${r.id}</span>` 
            },
            { 
                header: 'Titular de Licencia', 
                render: (r) => {
                    // Verificamos si existe la relación conductores (belongsToMany)
                    const conductor = r.conductores && r.conductores.length > 0 ? r.conductores[0] : null;
                    if (!conductor || !conductor.persona) return '<span class="text-xs text-red-500 italic font-bold uppercase tracking-tighter">Sin Asignar</span>';
                    
                    const p = conductor.persona;
                    return `
                        <div class="flex flex-col">
                            <span class="font-bold text-slate-700 uppercase tracking-tight text-[11px] leading-tight">${p.name || ''} ${p.last_name || ''}</span>
                            <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">${p.nui || 'Auditoría NBI'}</span>
                        </div>
                    `;
                }
            },
            { header: 'Número de Licencia', key: 'numero', render: (r) => `<span class="font-bold text-slate-700 tracking-tight">${r.numero}</span>` },
            { 
                header: 'Categoría', 
                filterOptions: ['C1', 'C2'],
                render: (r) => {
                    const txt = r.categoria ? r.categoria.codigo : '-';
                    return `<span class="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-[10px] font-bold uppercase border border-sky-100 shadow-sm">${txt}</span>`;
                }
            },
            { 
                header: 'Estado de Vencimiento', 
                filterOptions: [
                    { value: 'VENCIDA', label: 'Vencidas' },
                    { value: 'PRÓXIMA', label: 'Próximas a vencer' },
                    { value: 'VIGENTE', label: 'Vigentes' } 
                ],
                render: (r) => {
                    if (!r.fecha_vencimiento) return '-';
                    const hoy = new Date();
                    const venc = new Date(r.fecha_vencimiento);
                    const diffDays = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
                    
                    let classes = 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-2 ring-emerald-50/50';
                    let label = `VIGENTE | ${r.fecha_vencimiento}`;

                    if (diffDays <= 0) {
                        classes = 'bg-rose-50 text-rose-800 border-rose-200 ring-4 ring-rose-500/10 animate-pulse';
                        label = `VENCIDA: ${r.fecha_vencimiento}`;
                    } else if (diffDays <= 30) {
                        classes = 'bg-amber-50 text-amber-800 border-amber-200 ring-2 ring-amber-50/50';
                        label = `PRÓXIMA: ${r.fecha_vencimiento}`;
                    }

                    return `<span class="px-4 py-1.5 rounded-xl ${classes} text-[11px] font-bold uppercase border shadow-sm inline-flex items-center gap-1.5 leading-none transition-all hover:scale-105 cursor-default tracking-wide">${label}</span>`;
                }
            },
            { header: 'Organismo', key: 'organismo_transito', render: (r) => `<span class="text-[11px] font-medium text-slate-500 italic">${r.organismo_transito || '-'}</span>` },
            { 
                header: 'Doc. Soporte', 
                render: (r) => {
                    if (!r.documento) return '<span class="text-xs text-gray-300 italic">Sin soporte</span>';
                    
                    const path = r.documento.url;
                    
                    return `
                        <button onclick="AdminBase.previewDocument('${path}', 'Licencia #${r.numero}')" 
                                class="flex items-center gap-2 px-5 py-2 bg-sky-50 text-sky-700 rounded-full text-[10px] font-bold hover:bg-sky-100 hover:scale-105 transition-all border border-sky-100 shadow-sm uppercase tracking-widest group">
                            <svg class="w-4 h-4 text-sky-600 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            VER EVIDENCIA
                        </button>
                    `;
                }
            },
            { header: 'Acciones', render: (r) => AdminBase.generateActionButtons(r, 'AdminLicencias') }
        ];
        
        AdminBase.renderTable(data, columns, 'licencias-table', 10);
    }

    async function loadAuxData() {
        // Cargar Categorías
        if (categoriasList.length === 0) {
            const res = await AdminBase.apiCall('/categorias_licencia', 'GET', { limit: 100 });
            if (res) categoriasList = res.data.data || res.data;
        }
        // Cargar Restricciones
        if (restriccionesList.length === 0) {
            const res = await AdminBase.apiCall('/restriccion_lic', 'GET', { limit: 100 });
            if (res) restriccionesList = res.data.data || res.data;
        }
        // Cargar Documentos (para asociar)
        if (documentosList.length === 0) {
            const res = await AdminBase.apiCall('/documentos', 'GET', { limit: 100 });
            if (res) documentosList = res.data.data || res.data;
        }
    }

    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-licencia');
        const form = document.getElementById('form-licencia');
        
        if(!modal) return;

        // Cargar dependencias
        await loadAuxData();

        const selCat = document.getElementById('licencia-categoria');
        const selRes = document.getElementById('licencia-restriccion');
        const selDoc = document.getElementById('licencia-documento');

        selCat.innerHTML = '<option value="">Seleccione...</option>';
        categoriasList.forEach(c => selCat.innerHTML += `<option value="${c.id}">${c.codigo}</option>`);

        selRes.innerHTML = '<option value="">Seleccione...</option>';
        restriccionesList.forEach(r => selRes.innerHTML += `<option value="${r.id}">${r.descripcion}</option>`);

        selDoc.innerHTML = '<option value="">Seleccione...</option>';
        documentosList.forEach(d => selDoc.innerHTML += `<option value="${d.id}">Doc #${d.id} (${d.observaciones || ''})</option>`);

        form.reset();
        modal.style.display = 'flex';
        document.getElementById('modal-licencia-title').textContent = id ? 'Editar Licencia' : 'Nueva Licencia';

        if (id) {
            const item = licenciasList.find(l => l.id === id);
            if (item) {
                selCat.value = item.categoria_lic_id;
                selRes.value = item.restriccion_lic_id;
                selDoc.value = item.documento_id;
                document.getElementById('licencia-numero').value = item.numero || '';
                document.getElementById('licencia-fecha-expedicion').value = item.fecha_expedicion || '';
                document.getElementById('licencia-fecha-vencimiento').value = item.fecha_vencimiento || '';
                document.getElementById('licencia-organismo').value = item.organismo_transito || '';
            }
        }
    }

    function closeModal() {
        document.getElementById('modal-licencia').style.display = 'none';
        editingId = null;
    }

    async function save(e) {
        e.preventDefault();
        const payload = {
            categoria_lic_id: document.getElementById('licencia-categoria').value,
            restriccion_lic_id: document.getElementById('licencia-restriccion').value,
            documento_id: document.getElementById('licencia-documento').value,
            numero: document.getElementById('licencia-numero').value,
            fecha_expedicion: document.getElementById('licencia-fecha-expedicion').value,
            fecha_vencimiento: document.getElementById('licencia-fecha-vencimiento').value,
            organismo_transito: document.getElementById('licencia-organismo').value,
            estado: 'vigente'
        };

        const btnSubmit = document.querySelector('#form-licencia button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

        try {
            let res;
            if (editingId) res = await AdminBase.apiCall(`/licencias/${editingId}`, 'PUT', payload);
            else res = await AdminBase.apiCall('/licencias', 'POST', payload);
            if (res && res.status) {
                AdminBase.showNotification('success', 'Éxito', 'Licencia guardada.');
                closeModal();
                load();
            }
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
        }
    }

    async function destroy(id) {
        if (confirm('¿Eliminar?')) {
            await AdminBase.apiCall(`/licencias/${id}`, 'DELETE');
            load();
        }
    }

    async function restore(id) {
        if (confirm('¿Restaurar?')) {
            await AdminBase.apiCall(`/licencias/${id}/rehabilitate`, 'POST');
            load();
        }
    }

    return { init, load, openModal, destroy, restore };
})();

window.AdminLicencias = AdminLicencias;