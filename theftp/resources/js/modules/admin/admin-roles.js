/**
 * ============================================
 * ADMIN ROLES MODULE
 * ============================================
 * Gestion de roles: lista, modal, guardar, eliminar.
 * Depende de: AdminBase (window.AdminBase)
 */

let adminRolesStore = [];
let editingRoleId = null;

// -----------------------------------------------
// Busqueda en tabla de roles
// -----------------------------------------------
function setupRolesSearch() {
    const input = document.getElementById('search-roles');
    if (!input) return;
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    newInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = adminRolesStore.filter(item =>
            String(item.descripcion || '').toLowerCase().includes(term)
        );
        renderRoles(filtered);
    });
}

// -----------------------------------------------
// Cargar roles
// -----------------------------------------------
async function loadRoles() {
    const container = document.getElementById('roles-table');
    if (!container) return;
    container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando roles...</div>';

    const res = await AdminBase.apiCall('/rol');
    if (res && res.data) {
        adminRolesStore = res.data.data || res.data;
        renderRoles(adminRolesStore);
        setupRolesSearch();
    }
}

// -----------------------------------------------
// Renderizar tabla de roles
// -----------------------------------------------
function renderRoles(data) {
    const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Descripcion', key: 'descripcion' },
        {
            header: 'Acciones',
            render: (r) => `
            <div class="flex gap-2">
                <button onclick="openModalRole(${r.id}, '${r.descripcion}')" class="text-yellow-600 hover:text-yellow-800" title="Editar">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button onclick="deleteRole(${r.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>`
        }
    ];
    AdminBase.renderTable(data, columns, 'roles-table');
}

// -----------------------------------------------
// Modal de rol
// -----------------------------------------------
window.openModalRole = function(id = null, desc = '') {
    editingRoleId = id;
    document.getElementById('modal-role').style.display = 'flex';
    document.getElementById('form-role').reset();
    document.getElementById('modal-role-title').textContent = id ? 'Editar Rol' : 'Crear Rol';
    if (id) document.getElementById('role-desc').value = desc;
};

// -----------------------------------------------
// Guardar rol
// -----------------------------------------------
async function saveRole(e) {
    e.preventDefault();
    const desc = document.getElementById('role-desc').value;
    const payload = { descripcion: desc };

    const btnSubmit = document.querySelector('#form-role button[type="submit"]');
    if (btnSubmit && btnSubmit.disabled) return;
    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

    try {
        let result;
        if (editingRoleId) {
            result = await AdminBase.apiCall(`/rol/${editingRoleId}`, 'PUT', payload);
        } else {
            result = await AdminBase.apiCall('/rol', 'POST', payload);
        }
        if (result && result.status) {
            AdminBase.showNotification('success', 'Exito', 'Rol guardado.');
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
window.deleteRole = async function(id) {
    if (!confirm('Eliminar rol?')) return;
    const res = await AdminBase.apiCall(`/rol/${id}`, 'DELETE');
    if (res && res.status) {
        AdminBase.showNotification('success', 'Eliminado', 'Rol eliminado.');
        loadRoles();
    }
};

// Exponer globalmente
window.loadRoles = loadRoles;
window.renderRoles = renderRoles;
window.saveRole = saveRole;