/**
 * ============================================
 * ADMIN EMPRESAS MODULE
 * ============================================
 * Gestión de empresas y su clasificación.
 */
const AdminEmpresas = (function() {
    'use strict';

    let isInitialized = false;
    let empresasList = [];
    let tiposEmpresaList = []; // Para el select
    let editingId = null;

    function init() {
        if (isInitialized) return;

        console.log('🚀 Inicializando AdminEmpresas...');

        const btnAdd = document.getElementById('btn-add-empresa');
        if (btnAdd) btnAdd.addEventListener('click', () => openModal());

        const form = document.getElementById('form-empresa');
        if (form) form.addEventListener('submit', save);

        const btnCancel = document.getElementById('btn-cancel-empresa');
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        const toggle = document.getElementById('toggle-deleted-empresas');
        if (toggle) toggle.addEventListener('change', load);

        isInitialized = true;
    }

    async function load() {
        const container = document.getElementById('empresas-table');
        if (!container) return;

        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando empresas...</div>';
        const showDeleted = document.getElementById('toggle-deleted-empresas')?.checked || false;

        // Pedimos la relación 'tipo_empresa' para mostrar el nombre en la tabla
        const params = {
            limit: 100,
            include: 'tipo_empresa',
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const res = await AdminBase.apiCall('/empresas', 'GET', params);

        if (res && res.data) {
            empresasList = res.data.data || res.data;
            render(empresasList);
        } else {
            container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos.</div>';
        }
    }

    function render(data) {
        const columns = [
            { header: 'NIT', key: 'nit' },
            { header: 'Nombre Legal', key: 'name', render: (r) => `<span class="font-bold text-gray-800">${r.name}</span>` },
            { 
                header: 'Tipo', 
                render: (r) => r.tipo_empresa 
                    ? `<span class="px-2 py-1 text-xs rounded bg-purple-50 text-purple-700 border border-purple-200">${r.tipo_empresa.descripcion}</span>` 
                    : '-' 
            },
            { 
                header: 'Estado', 
                render: (r) => r.deleted_at 
                    ? `<span class="badge bg-red-100 text-red-800">Eliminado</span>` 
                    : `<span class="badge bg-green-100 text-green-800">Activo</span>`
            },
            { 
                header: 'Acciones', 
                render: (r) => AdminBase.generateActionButtons(r, 'AdminEmpresas') 
            }
        ];
        AdminBase.renderTable(data, columns, 'empresas-table');
    }

    // Cargar Tipos de Empresa para el Select del Modal
    async function loadTipos() {
        if (tiposEmpresaList.length > 0) return; // Usar caché
        
        // Asumimos que existe el endpoint /api/tipo-empresa según tu lista
        const res = await AdminBase.apiCall('/tipo-empresa', 'GET', { limit: 100 });
        if (res && res.data) {
            tiposEmpresaList = res.data.data || res.data;
        }
    }

    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-empresa');
        const form = document.getElementById('form-empresa');
        const title = document.getElementById('modal-empresa-title');
        const selectTipo = document.getElementById('empresa-tipo');

        if (!modal) return;

        selectTipo.innerHTML = '<option>Cargando...</option>';
        await loadTipos();

        // Llenar Select
        selectTipo.innerHTML = '<option value="">-- Seleccione Tipo --</option>';
        tiposEmpresaList.forEach(t => {
            selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
        });

        form.reset();
        modal.style.display = 'flex';
        title.textContent = id ? 'Editar Empresa' : 'Nueva Empresa';

        if (id) {
            let item = empresasList.find(e => e.id === id);
            if (!item) {
                const res = await AdminBase.apiCall(`/empresas/${id}`);
                item = res.data;
            }

            if (item) {
                document.getElementById('empresa-nit').value = item.nit;
                document.getElementById('empresa-name').value = item.name;
                selectTipo.value = item.tipo_empresa_id;
            }
        }
    }

    function closeModal() {
        document.getElementById('modal-empresa').style.display = 'none';
        editingId = null;
    }

    async function save(e) {
        e.preventDefault();
        
        const payload = {
            nit: document.getElementById('empresa-nit').value,
            name: document.getElementById('empresa-name').value,
            tipo_empresa_id: document.getElementById('empresa-tipo').value
        };

        // Validación simple
        if (!payload.tipo_empresa_id) {
            AdminBase.showNotification('warning', 'Falta información', 'Seleccione el tipo de empresa.');
            return;
        }

        let res;
        if (editingId) {
            res = await AdminBase.apiCall(`/empresas/${editingId}`, 'PUT', payload);
        } else {
            res = await AdminBase.apiCall('/empresas', 'POST', payload);
        }

        if (res && res.status) {
            AdminBase.showNotification('success', 'Éxito', 'Empresa guardada correctamente.');
            closeModal();
            load();
        }
    }

    async function destroy(id) {
        if (confirm('¿Eliminar empresa?')) {
            const res = await AdminBase.apiCall(`/empresas/${id}`, 'DELETE');
            if (res?.status) {
                AdminBase.showNotification('success', 'Eliminado', 'Registro eliminado.');
                load();
            }
        }
    }

    async function restore(id) {
        if (confirm('¿Restaurar empresa?')) {
            const res = await AdminBase.apiCall(`/empresas/${id}/rehabilitate`, 'POST');
            if (res?.status) {
                AdminBase.showNotification('success', 'Restaurado', 'Registro restaurado.');
                load();
            }
        }
    }

    return { init, load, openModal, destroy, restore };
})();

window.AdminEmpresas = AdminEmpresas;