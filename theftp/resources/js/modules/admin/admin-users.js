/**
 * ============================================
 * ADMIN USERS MODULE
 * ============================================
 * Gestion completa de usuarios: lista, modal, CRUD, busqueda.
 * Depende de: AdminBase (window.AdminBase)
 *
 * MEJORAS vs monolito original:
 * - Usa AdminBase.apiCall (soporte FormData, manejo de 422, etc.)
 * - Usa AdminBase.renderTable y AdminBase.showNotification
 * - fetchAllPersonas usa paginacion segura (igual que el original)
 */

// Estado local del modulo
let adminUsersStore = {
    users: [],
    roles: [],
    personas: []
};

let editingUserId = null;

// -----------------------------------------------
// Carga paginada de personas (evita limite 422)
// -----------------------------------------------
async function fetchAllPersonas() {
    let allPersonas = [];
    let page = 1;
    let hasMore = true;
    const limit = 100;

    AdminBase.showNotification('info', 'Cargando Directorio', 'Obteniendo lista completa de personas...');

    while (hasMore) {
        const res = await AdminBase.apiCall('/personas', 'GET', { page, limit });
        if (res && res.data) {
            const data = res.data.data || res.data;
            if (Array.isArray(data) && data.length > 0) {
                allPersonas = allPersonas.concat(data);
                hasMore = data.length >= limit;
                page++;
            } else {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }
    return allPersonas;
}

// -----------------------------------------------
// Cargar empresas en el select del modal
// -----------------------------------------------
async function loadEmpresasForSelect() {
    const select = document.getElementById('user-empresa');
    if (!select) return;
    select.innerHTML = '<option>Cargando...</option>';
    const res = await AdminBase.apiCall('/empresas', 'GET', { limit: 1000 });
    select.innerHTML = '<option value="">Seleccione la Empresa</option>';
    if (res && res.data) {
        const list = res.data.data || res.data;
        list.forEach(e => {
            select.innerHTML += `<option value="${e.id}">${e.name} (NIT: ${e.nit})</option>`;
        });
    }
}

// -----------------------------------------------
// Renderizar select de personas con filtro
// -----------------------------------------------
function renderPersonasSelect(list, selectedId = null) {
    const select = document.getElementById('user-persona');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione una persona...</option>';

    if (list.length === 0) {
        select.innerHTML += '<option value="" disabled>No hay personas disponibles</option>';
        return;
    }

    const limit = 100;
    let count = 0;

    for (const p of list) {
        if (count >= limit && p.id !== selectedId) continue;
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name} ${p.last_name} - ${p.nui}`;
        if (p.id === selectedId) option.selected = true;
        select.appendChild(option);
        count++;
    }

    if (list.length > limit) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = `... y ${list.length - limit} mas (use el buscador)`;
        select.appendChild(option);
    }
}

// -----------------------------------------------
// Buscador de personas dentro del modal
// -----------------------------------------------
function setupPersonaFilter() {
    const input = document.getElementById('filter-persona-input');
    if (!input) return;

    input.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = adminUsersStore.personas.filter(p => {
            const fullName = `${p.name} ${p.last_name}`.toLowerCase();
            return fullName.includes(term) || String(p.nui).includes(term);
        });
        const currentVal = document.getElementById('user-persona')?.value
            ? parseInt(document.getElementById('user-persona').value)
            : null;
        renderPersonasSelect(filtered, currentVal);
    });
}

// -----------------------------------------------
// Busqueda en tabla de usuarios
// -----------------------------------------------
function setupUsersSearch() {
    const input = document.getElementById('search-users');
    if (!input) return;
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    newInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = adminUsersStore.users.filter(item =>
            ['name', 'email'].some(key => String(item[key] || '').toLowerCase().includes(term))
        );
        renderUsers(filtered);
    });
}

// -----------------------------------------------
// Cargar usuarios
// -----------------------------------------------
async function loadUsers() {
    const container = document.getElementById('users-table');
    if (!container) return;
    container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando usuarios...</div>';

    const showDeleted = document.getElementById('toggle-deleted-users')?.checked || false;
    const params = {
        include: 'rol,persona',
        limit: 1000,
        ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
    };

    const res = await AdminBase.apiCall('/users', 'GET', params);

    if (res && res.data) {
        adminUsersStore.users = res.data.data || res.data;
        renderUsers(adminUsersStore.users);
        setupUsersSearch();
    } else {
        container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos.</div>';
    }
}

// -----------------------------------------------
// Renderizar tabla de usuarios
// -----------------------------------------------
function renderUsers(data) {
    const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Nombre', key: 'name' },
        { header: 'Email', key: 'email' },
        {
            header: 'Rol',
            render: (r) => r.rol
                ? `<span class="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800">${r.rol.descripcion}</span>`
                : 'Sin Rol'
        },
        {
            header: 'Estado',
            render: (r) => r.deleted_at
                ? `<span class="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-800">Eliminado</span>`
                : `<span class="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-800">Activo</span>`
        },
        {
            header: 'Acciones',
            render: (r) => {
                if (r.deleted_at) {
                    return `
                    <button onclick="restoreUser(${r.id})" class="text-green-600 hover:text-green-800 font-semibold text-xs flex items-center gap-1" title="Restaurar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Restaurar
                    </button>`;
                }
                return `
                <div class="flex gap-2">
                    <button onclick="openModalUser(${r.id})" class="text-yellow-600 hover:text-yellow-800" title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onclick="deleteUser(${r.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>`;
            }
        }
    ];

    AdminBase.renderTable(data, columns, 'users-table');
}

// -----------------------------------------------
// Modal de usuario (crear / editar)
// -----------------------------------------------
window.openModalUser = async function(id = null) {
    editingUserId = id;
    const modal = document.getElementById('modal-user');
    const form = document.getElementById('form-user');
    const title = document.getElementById('modal-user-title');
    const filterInput = document.getElementById('filter-persona-input');

    form.reset();
    if (filterInput) filterInput.value = '';

    const groupEmpresa = document.getElementById('group-user-empresa');
    if (groupEmpresa) groupEmpresa.style.display = 'none';

    modal.style.display = 'flex';
    title.textContent = id ? 'Editar Usuario' : 'Crear Usuario';

    // Cargar roles
    const roleSelect = document.getElementById('user-role');
    roleSelect.onchange = (e) => {
        const isEmpresa = e.target.value == '3';
        if (groupEmpresa) groupEmpresa.style.display = isEmpresa ? 'block' : 'none';
        if (isEmpresa && document.getElementById('user-empresa').options.length <= 1) {
            loadEmpresasForSelect();
        }
    };

    if (roleSelect.options.length <= 1) {
        const roles = await AdminBase.apiCall('/rol');
        roleSelect.innerHTML = '<option value="">Seleccione Rol...</option>';
        if (roles && roles.data) {
            const list = roles.data.data || roles.data;
            list.forEach(r => {
                roleSelect.innerHTML += `<option value="${r.id}">${r.descripcion}</option>`;
            });
        }
    }

    // Cargar personas (paginado, con cache)
    if (adminUsersStore.personas.length === 0) {
        const personaSelect = document.getElementById('user-persona');
        if (personaSelect) {
            personaSelect.innerHTML = '<option>Cargando directorio...</option>';
            adminUsersStore.personas = await fetchAllPersonas();
            adminUsersStore.personas.sort((a, b) =>
                (a.name + a.last_name).localeCompare(b.name + b.last_name)
            );
        }
    }

    // Si es edicion, pre-llenar datos
    let currentPersonaId = null;
    if (id) {
        const user = adminUsersStore.users.find(u => u.id === id);
        if (user) {
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            roleSelect.value = user.rol_id;
            roleSelect.dispatchEvent(new Event('change'));

            if (user.rol_id == 3) {
                setTimeout(() => {
                    const empresaSelect = document.getElementById('user-empresa');
                    if (empresaSelect) empresaSelect.value = user.empresa_id || '';
                }, 500);
            }
            currentPersonaId = user.persona_id;
        }
    }

    renderPersonasSelect(adminUsersStore.personas, currentPersonaId);
};

// -----------------------------------------------
// Guardar usuario
// -----------------------------------------------
async function saveUser(e) {
    e.preventDefault();

    const roleId = document.getElementById('user-role').value;
    const payload = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        rol_id: roleId,
        persona_id: document.getElementById('user-persona').value
    };

    if (roleId == '3') {
        const empresaId = document.getElementById('user-empresa').value;
        if (!empresaId) return AdminBase.showNotification('warning', 'Falta Dato', 'Seleccione la empresa.');
        payload.empresa_id = empresaId;
    } else {
        payload.empresa_id = null;
    }

    const password = document.getElementById('user-password').value;
    if (password) payload.password = password;
    if (!editingUserId && !password) {
        return AdminBase.showNotification('warning', 'Atencion', 'La contrasena es obligatoria para nuevos usuarios.');
    }

    let result;
    if (editingUserId) {
        result = await AdminBase.apiCall(`/users/${editingUserId}`, 'PUT', payload);
    } else {
        result = await AdminBase.apiCall('/users', 'POST', payload);
    }

    if (result && result.status) {
        AdminBase.showNotification('success', 'Exito', 'Usuario guardado.');
        document.getElementById('modal-user').style.display = 'none';
        loadUsers();
    }
}

// -----------------------------------------------
// Eliminar / Restaurar usuario
// -----------------------------------------------
window.deleteUser = async function(id) {
    if (!confirm('Eliminar usuario?')) return;
    const res = await AdminBase.apiCall(`/users/${id}`, 'DELETE');
    if (res && res.status) {
        AdminBase.showNotification('success', 'Eliminado', 'Usuario eliminado.');
        loadUsers();
    }
};

window.restoreUser = async function(id) {
    if (!confirm('Restaurar usuario?')) return;
    const res = await AdminBase.apiCall(`/users/${id}/rehabilitate`, 'POST');
    if (res && res.status) {
        AdminBase.showNotification('success', 'Restaurado', 'Usuario habilitado.');
        loadUsers();
    }
};

// Exponer globalmente
window.loadUsers = loadUsers;
window.renderUsers = renderUsers;
window.saveUser = saveUser;
window.setupPersonaFilter = setupPersonaFilter;
window.fetchAllPersonas = fetchAllPersonas;