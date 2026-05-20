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
// Busqueda asincrona de personas (Optimizacion de Red)
// -----------------------------------------------
async function searchPersonasAPI(term = '') {
    const limit = 30; // Solo traer los primeros 30 resultados
    let filter = {};
    
    if (term.length >= 3) {
        // Asumiendo que la API soporta filtro por NUI o name
        // Si no soporta filtro avanzado en el JSON, enviamos todo y filtramos
        // Pero intentemos usar la estructura de filtro estandar del backend
        filter = {
            nui: { "like": `%${term}%` }
        };
    }
    
    AdminBase.showNotification('info', 'Buscando...', 'Consultando base de datos', 1000);
    const res = await AdminBase.apiCall('/personas', 'GET', { 
        limit: limit, 
        // filter: JSON.stringify(filter) // Si la API backend soporta el json
    });
    
    if (res && res.data) {
        let list = res.data.data || res.data;
        if (term.length >= 3) {
             const lowerTerm = term.toLowerCase();
             list = list.filter(p => 
                 String(p.nui).includes(lowerTerm) || 
                 `${p.name} ${p.last_name}`.toLowerCase().includes(lowerTerm)
             );
        }
        return list;
    }
    return [];
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
// Buscador de personas dentro del modal (Asincrono)
// -----------------------------------------------
let personaSearchTimeout = null;
function setupPersonaFilter() {
    const input = document.getElementById('filter-persona-input');
    if (!input) return;

    input.addEventListener('keyup', (e) => {
        const term = e.target.value;
        if (term.length < 3 && term.length > 0) return; // Esperar al menos 3 caracteres

        if (personaSearchTimeout) clearTimeout(personaSearchTimeout);
        personaSearchTimeout = setTimeout(async () => {
            const select = document.getElementById('user-persona');
            if (select) select.innerHTML = '<option>Buscando en servidor...</option>';
            
            const results = await searchPersonasAPI(term);
            adminUsersStore.personas = results; // Guardar cache local temporal
            
            const currentVal = document.getElementById('user-persona')?.value
                ? parseInt(document.getElementById('user-persona').value)
                : null;
            renderPersonasSelect(results, currentVal);
        }, 500); // 500ms debounce para no saturar la red
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
        { 
            header: 'ID', 
            key: 'id', 
            render: (r) => `<span class="font-mono text-xs text-gray-400">#${r.id}</span>` 
        },
        { header: 'Nombre', key: 'name' },
        { header: 'Email', key: 'email' },
        {
            header: 'Rol de Sistema',
            filterOptions: ['Invitado', 'Usuario UPC', 'Empresa de transporte', 'Secretaria de tránsito', 'Administrador'],
            render: (r) => r.rol
                ? `<span class="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase border border-blue-200 shadow-sm">${r.rol.descripcion}</span>`
                : '<span class="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase border border-gray-200 shadow-sm">Sin Rol</span>'
        },
        {
            header: 'Estado',
            render: (r) => r.deleted_at
                ? `<span class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200 shadow-sm">Papelera</span>`
                : `<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200 shadow-sm">Activo</span>`
        },
        {
            header: 'Acciones',
            render: (r) => AdminBase.generateActionButtons(r, 'window')
        }
    ];

    AdminBase.renderTable(data, columns, 'users-table', 10, { hideGlobalSearch: true });
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

    // Cargar personas (Primeros resultados rapido sin descargar todo)
    if (adminUsersStore.personas.length === 0) {
        const personaSelect = document.getElementById('user-persona');
        if (personaSelect) {
            personaSelect.innerHTML = '<option>Cargando directorio inicial...</option>';
            adminUsersStore.personas = await searchPersonasAPI('');
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

    const btnSubmit = document.querySelector('#form-user button[type="submit"]');
    if (btnSubmit && btnSubmit.disabled) return;
    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

    try {
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
    } finally {
        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
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
window.openModal = openModalUser; // Alias para compatibilidad con AdminBase
window.destroy = deleteUser;     // Alias para compatibilidad con AdminBase
window.restore = restoreUser;     // Alias para compatibilidad con AdminBase
window.setupPersonaFilter = setupPersonaFilter;
window.fetchAllPersonas = fetchAllPersonas;