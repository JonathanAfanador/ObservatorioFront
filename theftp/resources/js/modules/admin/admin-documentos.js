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
            { header: 'ID', key: 'id' },
            { header: 'Tipo', render: (r) => r.tipo_documento ? r.tipo_documento.descripcion : 'N/A' },
            { header: 'Observaciones', key: 'observaciones' },
            { 
                header: 'Archivo', 
                render: (r) => r.url 
                    ? `<a href="/api/documentos/${r.id}/file" target="_blank" class="text-blue-600 underline">Ver Archivo</a>` 
                    : 'Pendiente' 
            },
            { header: 'Acciones', render: (r) => AdminBase.generateActionButtons(r, 'AdminDocumentos') }
        ];
        AdminBase.renderTable(data, columns, 'documentos-table');
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
            // Hack para Laravel PUT con archivos
            formData.append('_method', 'POST'); // Asegúrate que tu ruta soporte POST para update o usa lógica especial
        }

        // Usamos POST siempre con FormData por compatibilidad
        const res = await AdminBase.apiCall(endpoint, 'POST', formData);

        if (res && res.status) {
            AdminBase.showNotification('success', 'Éxito', 'Documento guardado.');
            closeModal();
            load();
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