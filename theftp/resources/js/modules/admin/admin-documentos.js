/**
 * ============================================
 * ADMIN DOCUMENTOS MODULE
 * ============================================
 * Centro de Auditoría de Evidencias Documentales y Multimedia.
 */
const AdminDocumentos = (function() {
    'use strict';

    let isInitialized = false;
    let documentosList = [];
    let tiposDocList = [];
    let editingId = null;

    function init() {
        if (isInitialized) return;

        const btnAdd = document.getElementById('btn-add-documento');
        if (btnAdd) btnAdd.addEventListener('click', () => openModal());

        const form = document.getElementById('form-documento');
        if (form) form.addEventListener('submit', save);

        const btnCancel = document.getElementById('btn-cancel-documento');
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        const toggle = document.getElementById('toggle-deleted-documentos');
        if (toggle) toggle.addEventListener('change', load);

        // Vincular Buscador Local Exclusivo
        const searchInput = document.getElementById('search-documentos');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                AdminBase.applyGlobalSearch('documentos-table', e.target.value);
            });
        }

        isInitialized = true;
    }

    async function load() {
        const container = document.getElementById('documentos-table');
        if (!container) return;
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-gray-400 italic">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-3"></div>
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Sincronizando registros de auditoría...</p>
            </div>
        `;
        
        const showDeleted = document.getElementById('toggle-deleted-documentos')?.checked || false;
        const params = {
            limit: 500,
            include: 'tipo_documento', 
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const res = await AdminBase.apiCall('/documentos', 'GET', params);
        if (res) {
            documentosList = res.data?.data || res.data || [];
            render(documentosList);
        }
    }

    function render(data) {
        const columns = [
            { 
                header: 'ID', 
                key: 'id', 
                render: (r) => `<span class="font-mono text-[10px] font-bold text-slate-400">#${r.id}</span>` 
            },
            { 
                header: 'Tipo de Evidencia', 
                // Filtros solicitados según imagen oficial
                filterOptions: [
                    'PDF', 'Excel', 'CSV', 'Documento Word', 'Presentación', 
                    'Imagen (JPG/PNG)', 'GeoJSON', 'KML', 'Audio', 'Video'
                ],
                render: (r) => {
                    const desc = r.tipo_documento ? r.tipo_documento.descripcion : 'SIN CATEGORÍA';
                    return `<span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase border border-slate-200 shadow-sm transition-all hover:bg-white">${desc}</span>`;
                }
            },
            { 
                header: 'Observaciones / Descripción', 
                key: 'observaciones',
                render: (r) => `<span class="text-xs text-slate-600 font-medium">${r.observaciones || 'Sin descripción'}</span>`
            },
            { 
                header: 'Visor Institucional', 
                render: (r) => {
                    if (!r.url) return '<span class="text-slate-300 italic text-[10px] uppercase font-bold">Sin Soporte</span>';
                    
                    const fileName = r.tipo_documento ? r.tipo_documento.descripcion : 'Documento';
                    
                    // Ajuste inteligente de URL para evitar duplicados de /storage/
                    let fileUrl = r.url;
                    if (!fileUrl.startsWith('http')) {
                        const cleanPath = fileUrl.replace(/^\/?storage\//, '');
                        fileUrl = `/storage/${cleanPath}`;
                    }

                    return `
                        <button onclick="AdminBase.previewDocument(${r.id}, 'Auditoría: ${fileName}')" 
                                class="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white hover:scale-105 transition-all duration-300 border border-sky-100 shadow-sm group">
                             <svg class="w-4 h-4 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                             </svg>
                             <span class="font-black text-[10px] uppercase tracking-wider">Ver Evidencia</span>
                        </button>`;
                }
            },
            { 
                header: 'Estado', 
                // Se eliminó filterOptions para simplificar interfaz según solicitud
                render: (r) => r.deleted_at 
                    ? `<span class="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[9px] font-black uppercase border border-red-100">Papelera</span>` 
                    : `<span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase border border-emerald-100">Activo</span>`
            },
            { header: 'Acciones', render: (r) => AdminBase.generateActionButtons(r, 'AdminDocumentos') }
        ];

        // Render con búsqueda global oculta (usaremos nuestro buscador local del blade)
        AdminBase.renderTable(data, columns, 'documentos-table', 10, { hideGlobalSearch: true });
    }

    async function loadTipos() {
        if (tiposDocList.length === 0) {
            const res = await AdminBase.apiCall('/tipo_doc', 'GET', { limit: 100 });
            if (res) tiposDocList = res.data?.data || res.data || [];
        }
    }

    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-documento');
        const form = document.getElementById('form-documento');
        const selTipo = document.getElementById('documento-tipo');

        if (!modal) return;

        selTipo.innerHTML = '<option>Cargando categorías...</option>';
        await loadTipos();
        
        selTipo.innerHTML = '<option value="">-- Seleccione Categoría de Evidencia --</option>';
        tiposDocList.forEach(t => selTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`);

        form.reset();
        modal.style.display = 'flex';
        document.getElementById('modal-documento-title').textContent = id ? 'Editar Registro de Evidencia' : 'Nueva Evidencia Documental';

        if (id) {
            const item = documentosList.find(d => d.id === id);
            if (item) {
                selTipo.value = item.tipo_doc_id;
                document.getElementById('documento-obs').value = item.observaciones;
                document.getElementById('documento-file-help').textContent = "Dejar vacío para conservar el soporte actual.";
            }
        } else {
            document.getElementById('documento-file-help').textContent = "El sistema acepta PDF, Imágenes, Audio, Video y formatos Office/GIS.";
        }
    }

    function closeModal() {
        document.getElementById('modal-documento').style.display = 'none';
        editingId = null;
    }

    async function save(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('tipo_doc_id', document.getElementById('documento-tipo').value);
        formData.append('observaciones', document.getElementById('documento-obs').value);
        
        const fileInput = document.getElementById('documento-file');
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        let endpoint = '/documentos';
        if (editingId) {
            endpoint += `/${editingId}`;
            formData.append('_method', 'PUT');
        }

        const btnSubmit = document.querySelector('#form-documento button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando en la nube...'; }

        try {
            const res = await AdminBase.apiCall(endpoint, 'POST', formData);
            if (res) {
                AdminBase.showNotification('success', 'Sincronizado', 'Evidencia documentada correctamente.');
                closeModal();
                load();
            }
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
        }
    }

    async function destroy(id) {
        if (confirm('¿Mover este documento a la papelera?')) {
            const res = await AdminBase.apiCall(`/documentos/${id}`, 'DELETE');
            if (res) {
                AdminBase.showNotification('success', 'Eliminado', 'El registro ha sido movido a la papelera.');
                if (typeof AdminOverview !== 'undefined') AdminOverview.loadStats();
                load();
            }
        }
    }

    async function restore(id) {
        if (confirm('¿Restaurar acceso a esta evidencia?')) {
            const res = await AdminBase.apiCall(`/documentos/${id}/rehabilitate`, 'POST');
            if (res) {
                AdminBase.showNotification('success', 'Restaurado', 'El documento vuelve a estar activo.');
                if (typeof AdminOverview !== 'undefined') AdminOverview.loadStats();
                load();
            }
        }
    }

    return { init, load, openModal, destroy, restore };
})();

window.AdminDocumentos = AdminDocumentos;