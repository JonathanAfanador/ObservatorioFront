/**
 * ============================================
 * ADMIN ROLES MODULE
 * ============================================
 * Gestión de roles administrativos.
 * Actualizado: Corrección de endpoints (/api/roles-menus) y visibilidad global.
 */

let adminRolesStore = [];
let editingRoleId = null;

async function initAdminRoles() {
    console.log('🚀 Inicializando Módulo de Roles...');
    const btnAdd = document.getElementById('btn-add-role');
    if (btnAdd) btnAdd.onclick = () => openModalRole();

    const form = document.getElementById('form-role');
    if (form) form.onsubmit = saveRole;

    const btnCancel = document.getElementById('btn-cancel-role');
    if (btnCancel) btnCancel.onclick = () => document.getElementById('modal-role').style.display = 'none';

    await loadRoles();
}

async function loadRoles() {
    const container = document.getElementById('roles-table');
    if (!container) return;

    container.innerHTML = '<div class="p-4 text-center text-gray-500 italic">Cargando roles...</div>';

    try {
        // CORRECCIÓN: El endpoint correcto para gestionar roles es /api/rol
        const response = await AdminBase.apiCall('/rol', 'GET', { limit: 100 });
        if (response && response.data) {
            adminRolesStore = response.data.data || response.data;
            renderRoles(adminRolesStore);
        }
    } catch (e) {
        container.innerHTML = `<div class="p-4 text-center text-red-500 font-bold">Error: ${e.message}</div>`;
    }
}

function renderRoles(data) {
    const columns = [
        { 
            header: 'ID', 
            key: 'id', 
            render: (r) => `<span class="font-mono text-xs text-gray-400">#${r.id}</span>` 
        },
        { header: 'Descripción del Rol', key: 'descripcion', render: (r) => `<span class="font-bold text-slate-700">${r.descripcion}</span>` },
        {
            header: 'Acciones',
            render: (r) => AdminBase.generateActionButtons(r, 'AdminRoles')
        }
    ];
    // Paginación automática con buscador global oculto (módulo pequeño)
    AdminBase.renderTable(data, columns, 'roles-table', 10, { hideGlobalSearch: true });
}

// -----------------------------------------------
// Modal de rol (EXPORTADO GLOBALMENTE)
// -----------------------------------------------
window.openModalRole = function(id = null) {
    editingRoleId = id;
    const item = id ? adminRolesStore.find(r => r.id === id) : null;
    
    const modal = document.getElementById('modal-role');
    if (!modal) return;

    modal.style.display = 'flex';
    document.getElementById('form-role').reset();
    document.getElementById('modal-role-title').textContent = id ? 'Editar Rol Administrativo' : 'Crear Nuevo Rol';
    
    if (id && item) {
        document.getElementById('role-desc').value = item.descripcion;
    }
};

// -----------------------------------------------
// Guardar rol (EXPORTADO GLOBALMENTE)
// -----------------------------------------------
window.saveRole = async function(e) {
    e.preventDefault();
    const desc = document.getElementById('role-desc').value;
    const payload = { descripcion: desc };

    const btnSubmit = document.querySelector('#form-role button[type="submit"]');
    if (btnSubmit && btnSubmit.disabled) return;
    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

    try {
        let result;
        if (editingRoleId) {
            // CORRECCIÓN: Endpoint /api/rol
            result = await AdminBase.apiCall(`/rol/${editingRoleId}`, 'PUT', payload);
        } else {
            result = await AdminBase.apiCall('/rol', 'POST', payload);
        }

        if (result && result.status) {
            AdminBase.showNotification('success', 'Éxito', 'Rol guardado correctamente.');
            document.getElementById('modal-role').style.display = 'none';
            loadRoles();
        }
    } finally {
        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
    }
}

// -----------------------------------------------
// Eliminar rol
// -----------------------------------------------
window.destroyRole = async function(id) {
    if (!confirm('¿Seguro de eliminar este rol?')) return;
    const res = await AdminBase.apiCall(`/rol/${id}`, 'DELETE');
    if (res && res.status) {
        AdminBase.showNotification('success', 'Eliminado', 'Rol eliminado con éxito.');
        loadRoles();
    }
};

// Objeto de módulo para compatibilidad interna
window.AdminRoles = {
    init: initAdminRoles,
    load: loadRoles,
    openModal: (id) => window.openModalRole(id),
    destroy: (id) => window.destroyRole(id)
};

// Iniciar al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('roles-table')) {
        AdminRoles.init();
    }
});