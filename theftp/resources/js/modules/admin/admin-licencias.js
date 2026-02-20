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
            include: 'categoria,restriccion,documento', // Nombres de las relaciones en el modelo
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
            { header: 'ID', key: 'id' },
            { header: 'Categoría', render: (r) => r.categoria ? `${r.categoria.codigo} - ${r.categoria.descripcion}` : '-' },
            { header: 'Restricción', render: (r) => r.restriccion ? r.restriccion.descripcion : 'Ninguna' },
            { header: 'Doc. Soporte', render: (r) => r.documento ? `Doc #${r.documento.id}` : '-' },
            { header: 'Acciones', render: (r) => AdminBase.generateActionButtons(r, 'AdminLicencias') }
        ];
        AdminBase.renderTable(data, columns, 'licencias-table');
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
            documento_id: document.getElementById('licencia-documento').value
        };

        let res;
        if (editingId) res = await AdminBase.apiCall(`/licencias/${editingId}`, 'PUT', payload);
        else res = await AdminBase.apiCall('/licencias', 'POST', payload);

        if (res && res.status) {
            AdminBase.showNotification('success', 'Éxito', 'Licencia guardada.');
            closeModal();
            load();
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