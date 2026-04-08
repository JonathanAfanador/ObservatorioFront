/**
 * ============================================
 * ADMIN DOCUMENTOS MODULE
 * ============================================
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

        isInitialized = true;
    }

    async function load() {
        const container = document.getElementById('documentos-table');
        if (!container) return;
        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando documentos...</div>';
        
        const showDeleted = document.getElementById('toggle-deleted-documentos')?.checked || false;
        const params = {
            limit: 100,
            include: 'tipo_documento', // Ojo: en tu modelo la relación se llama tipo_documento
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const res = await AdminBase.apiCall('/documentos', 'GET', params);
        if (res && res.data) {
            documentosList = res.data.data || res.data;
            render(documentosList);
        }
    }

    function render(data) {
        const columns = [
            { 
                header: 'ID', 
                key: 'id', 
                render: (r) => `<span class="font-mono text-xs text-gray-400">#${r.id}</span>` 
            },
            { 
                header: 'Tipo de Evidencia', 
                filterOptions: ['SOPORTE', 'LICENCIA', 'USUARIO', 'CONDUCTOR', 'VEHICULO', 'EMPRESA'],
                render: (r) => {
                    const desc = r.tipo_documento ? r.tipo_documento.descripcion : 'SIN TIPO';
                    return `<span class="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-200 shadow-sm">${desc}</span>`;
                }
            },
            { header: 'Observaciones', key: 'observaciones' },
            { 
                header: 'Contenido / Archivo', 
                render: (r) => r.url 
                    ? `<button onclick="window.open('/api/documentos/${r.id}/file', '_blank')" 
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 border border-blue-100 shadow-sm font-bold text-[10px] uppercase">
                         <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                         Ver Evidencia
                       </button>` 
                    : '<span class="text-gray-400 italic text-xs">Sin archivo</span>' 
            },
            { 
                header: 'Estado', 
                filterOptions: ['Activo', 'Papelera'],
                render: (r) => r.deleted_at 
                    ? `<span class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200 shadow-sm">Papelera</span>` 
                    : `<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200 shadow-sm">Activo</span>`
            },
            { header: 'Acciones', render: (r) => AdminBase.generateActionButtons(r, 'AdminDocumentos') }
        ];
        // Activamos paginación automática (10 por página)
        AdminBase.renderTable(data, columns, 'documentos-table', 10);
    }

    async function loadTipos() {
        if (tiposDocList.length === 0) {
            const res = await AdminBase.apiCall('/tipo_doc', 'GET', { limit: 100 });
            if (res && res.data) tiposDocList = res.data.data || res.data;
        }
    }

    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-documento');
        const form = document.getElementById('form-documento');
        const selTipo = document.getElementById('documento-tipo');

        if (!modal) return;

        selTipo.innerHTML = '<option>Cargando...</option>';
        await loadTipos();
        
        selTipo.innerHTML = '<option value="">-- Seleccione Tipo --</option>';
        tiposDocList.forEach(t => selTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`);

        form.reset();
        modal.style.display = 'flex';
        document.getElementById('modal-documento-title').textContent = id ? 'Editar Documento' : 'Nuevo Documento';

        if (id) {
            const item = documentosList.find(d => d.id === id);
            if (item) {
                selTipo.value = item.tipo_doc_id;
                document.getElementById('documento-obs').value = item.observaciones;
                document.getElementById('documento-file-help').textContent = "Dejar vacío para mantener archivo.";
            }
        } else {
            document.getElementById('documento-file-help').textContent = "Seleccione un archivo.";
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
            formData.append('_method', 'POST');
        }

        const btnSubmit = document.querySelector('#form-documento button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

        try {
            const res = await AdminBase.apiCall(endpoint, 'POST', formData);
            if (res && res.status) {
                AdminBase.showNotification('success', 'Éxito', 'Documento guardado.');
                closeModal();
                load();
            }
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
        }
    }

    async function destroy(id) {
        if (confirm('¿Eliminar?')) {
            await AdminBase.apiCall(`/documentos/${id}`, 'DELETE');
            load();
        }
    }

    async function restore(id) {
        if (confirm('¿Restaurar?')) {
            await AdminBase.apiCall(`/documentos/${id}/rehabilitate`, 'POST');
            load();
        }
    }

    return { init, load, openModal, destroy, restore };
})();

window.AdminDocumentos = AdminDocumentos;