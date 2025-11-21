// Dashboard Administrador - Gestión Total
// ========================================

// --- Configuración Global ---
let adminStore = {
    users: [],
    roles: [],
    personas: [] // Se carga bajo demanda
};

let editingUserId = null;
let editingRoleId = null;

// --- Utilidades API ---
function getToken() {
    return localStorage.getItem('auth_token');
}

function showNotification(type, title, message) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    
    let icon = '';
    if(type === 'success') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    if(type === 'error') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    if(type === 'warning') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';

    div.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    div.querySelector('.notification-close').addEventListener('click', () => div.remove());
    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' };
    
    try {
        const res = await fetch(`/api${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        const json = await res.json();

        if (!res.ok) {
            if (res.status === 422 && json.errors) {
                // Formatear errores de validación
                const errorMsg = Object.entries(json.errors)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join('\n');
                throw new Error(errorMsg);
            }
            throw new Error(json.message || `Error HTTP: ${res.status}`);
        }
        return json;
    } catch (err) {
        console.error("API Error:", err);
        showNotification('error', 'Error del Sistema', err.message);
        return null;
    }
}

// --- FUNCIÓN DE CARGA MASIVA SEGURA (Evita error 422 por límite) ---
async function fetchAllPersonas() {
    let allPersonas = [];
    let page = 1;
    let hasMore = true;
    const limit = 100; // Límite seguro

    showNotification('info', 'Cargando Directorio', 'Obteniendo lista completa de personas...');

    while (hasMore) {
        // Pedimos página por página para no saturar el backend
        const res = await apiCall(`/personas?page=${page}&limit=${limit}`);
        
        if (res && (res.data || res.data.data)) {
            const data = res.data.data || res.data;
            
            if (Array.isArray(data) && data.length > 0) {
                allPersonas = allPersonas.concat(data);
                if (data.length < limit) hasMore = false; // Última página
                else page++;
            } else {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }
    return allPersonas;
}

// --- MENÚ LATERAL ---
function buildAdminMenu() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;
    
    sidebarNav.innerHTML = `
        <p class="nav-section-title">Administración</p>
        <a href="#overview" class="nav-link active" data-view="overview">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span>Resumen</span>
        </a>
        <a href="#users" class="nav-link" data-view="users">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span>Usuarios</span>
        </a>
        <a href="#roles" class="nav-link" data-view="roles">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>Roles y Permisos</span>
        </a>
    `;
    setupNavigation();
}

function setupNavigation() {
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const view = link.getAttribute('data-view');
            if(view) {
                e.preventDefault();
                document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
                document.getElementById(`view-${view}`).style.display = 'block';
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const headerTitle = document.getElementById('header-title');
                if(headerTitle) headerTitle.textContent = 'Administración - ' + view.charAt(0).toUpperCase() + view.slice(1);
                loadViewData(view);
            }
        });
    });
}

async function loadViewData(view) {
    switch(view) {
        case 'overview': loadStats(); break;
        case 'users': loadUsers(); break;
        case 'roles': loadRoles(); break;
    }
}

// --- RESUMEN ---
async function loadStats() {
    try {
        const [users, roles, audits] = await Promise.all([
            apiCall('/users?limit=1'),
            apiCall('/rol?limit=1'),
            apiCall('/auditoria?limit=1')
        ]);

        const container = document.getElementById('admin-stats');
        if(container) {
            // Renderizado de tarjetas (simplificado para este ejemplo)
            container.innerHTML = `
                <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
                        <div class="ml-4"><p class="text-sm font-medium text-gray-500">Usuarios</p><p class="text-2xl font-bold text-gray-900">${users.total || 0}</p></div>
                    </div>
                </div>
                <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
                        <div class="ml-4"><p class="text-sm font-medium text-gray-500">Roles</p><p class="text-2xl font-bold text-gray-900">${roles.total || 0}</p></div>
                    </div>
                </div>
                 <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg></div>
                        <div class="ml-4"><p class="text-sm font-medium text-gray-500">Auditoría</p><p class="text-2xl font-bold text-gray-900">${audits.total || 0}</p></div>
                    </div>
                </div>
            `;
        }
    } catch(e) { console.error(e); }
}

function renderTable(data, columns, containerId) {
    const container = document.getElementById(containerId);
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No hay datos disponibles.</div>';
        return;
    }
    let html = `<div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"><table class="min-w-full divide-y divide-gray-200 bg-white text-sm"><thead class="bg-gray-50"><tr>`;
    columns.forEach(col => html += `<th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">${col.header}</th>`);
    html += `</tr></thead><tbody class="divide-y divide-gray-200">`;
    data.forEach(row => {
        const rowClass = row.deleted_at ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50';
        html += `<tr class="${rowClass}">`;
        columns.forEach(col => {
            let val = col.render ? col.render(row) : (row[col.key] || '-');
            html += `<td class="px-4 py-3 text-gray-700 whitespace-nowrap">${val}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// ===============================
// GESTIÓN DE USUARIOS
// ===============================
async function loadUsers() {
    const container = document.getElementById('users-table');
    container.innerHTML = '<div class="loading-state"><p>Cargando usuarios...</p></div>';

    // Checkbox de "Ver Eliminados"
    const checkbox = document.getElementById('toggle-deleted-users');
    const showDeleted = checkbox ? checkbox.checked : false;
    
    // Parámetros: limit=1000 para traer buena cantidad, include para relaciones
    const params = showDeleted 
        ? '?include=rol,persona&limit=1000&onlySoftDeleted=true' 
        : '?include=rol,persona&limit=1000';

    const res = await apiCall(`/users${params}`);
    
    if (res && res.data) {
        adminStore.users = res.data.data || res.data;
        renderUsers(adminStore.users);
        setupSearch('search-users', adminStore.users, ['name', 'email'], renderUsers);
    } else {
        container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos.</div>';
    }
}

function renderUsers(data) {
    renderTable(data, [
        { header: 'ID', key: 'id' },
        { header: 'Nombre', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Rol', render: (r) => r.rol ? `<span class="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800">${r.rol.descripcion}</span>` : 'Sin Rol' },
        { header: 'Estado', render: (r) => r.deleted_at 
            ? `<span class="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-800">Eliminado</span>` 
            : `<span class="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-800">Activo</span>` 
        },
        { header: 'Acciones', render: (r) => {
            if (r.deleted_at) {
                // Botón de Restaurar
                return `
                <button onclick="restoreUser(${r.id})" class="text-green-600 hover:text-green-800 font-semibold text-xs flex items-center gap-1" title="Restaurar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Restaurar
                </button>`;
            } else {
                // Botones Editar/Eliminar
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
        }}
    ], 'users-table');
}

// --- Lógica del Modal de Usuario (CON SELECT EMPRESAS Y BUSCADOR PERSONAS) ---
window.openModalUser = async function(id = null) {
    editingUserId = id;
    const modal = document.getElementById('modal-user');
    const form = document.getElementById('form-user');
    const title = document.getElementById('modal-user-title');
    const filterInput = document.getElementById('filter-persona-input'); 

    form.reset();
    if(filterInput) filterInput.value = ''; 
    
    // Ocultar selector de empresa por defecto
    const groupEmpresa = document.getElementById('group-user-empresa');
    if(groupEmpresa) groupEmpresa.style.display = 'none';

    modal.style.display = 'flex';
    title.textContent = id ? 'Editar Usuario' : 'Crear Usuario';

    // 1. Cargar Roles
    const roleSelect = document.getElementById('user-role');
    
    // Evento: Si el rol es "Empresa" (ID 3), mostrar select de empresas
    roleSelect.onchange = (e) => {
        const isEmpresa = e.target.value == "3"; // ID 3 = Rol Empresa
        if(groupEmpresa) groupEmpresa.style.display = isEmpresa ? 'block' : 'none';
        
        // Cargar lista de empresas si es necesario y no se ha cargado
        if(isEmpresa && document.getElementById('user-empresa').options.length <= 1) {
            loadEmpresasForSelect(); // ¡ESTA ES LA FUNCIÓN QUE FALTABA!
        }
    };

    if(roleSelect.options.length <= 1) {
        const roles = await apiCall('/rol');
        roleSelect.innerHTML = '<option value="">Seleccione Rol...</option>';
        if(roles && roles.data) {
            const list = roles.data.data || roles.data;
            list.forEach(r => {
                roleSelect.innerHTML += `<option value="${r.id}">${r.descripcion}</option>`;
            });
        }
    }

    // 2. Cargar Personas (Usando carga paginada para evitar límite 100)
    if (adminStore.personas.length === 0) {
        const personaSelect = document.getElementById('user-persona');
        if (personaSelect) {
            personaSelect.innerHTML = '<option>Cargando directorio...</option>';
            adminStore.personas = await fetchAllPersonas(); // Llama a la nueva función segura
            // Ordenar alfabéticamente
            adminStore.personas.sort((a, b) => (a.name + a.last_name).localeCompare(b.name + b.last_name));
        }
    }

    // 3. Si es edición, pre-llenar datos
    let currentPersonaId = null;
    if(id) {
        const user = adminStore.users.find(u => u.id === id);
        if(user) {
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            
            // Seleccionar Rol
            roleSelect.value = user.rol_id;
            // Disparar evento para mostrar/ocultar empresa
            roleSelect.dispatchEvent(new Event('change'));

            // Si es empresa, seleccionar la empresa correcta
            if(user.rol_id == 3) {
                 setTimeout(() => {
                     const empresaSelect = document.getElementById('user-empresa');
                     if(empresaSelect) empresaSelect.value = user.empresa_id || "";
                 }, 500); 
            }
            currentPersonaId = user.persona_id;
        }
    }
    // Renderizar select de personas
    renderPersonasSelect(adminStore.personas, currentPersonaId);
};

// --- Helper NUEVO para cargar empresas ---
async function loadEmpresasForSelect() {
    const select = document.getElementById('user-empresa');
    if(!select) return;
    select.innerHTML = '<option>Cargando...</option>';
    // Usamos limit=1000 para traer todas (si son muchas, usar paginación como en personas)
    const res = await apiCall('/empresas?limit=1000'); 
    select.innerHTML = '<option value="">Seleccione la Empresa</option>';
    if(res && res.data) {
        const list = res.data.data || res.data;
        list.forEach(e => {
            select.innerHTML += `<option value="${e.id}">${e.name} (NIT: ${e.nit})</option>`;
        });
    }
}

// Helper para renderizar personas (con filtro)
function renderPersonasSelect(list, selectedId = null) {
    const select = document.getElementById('user-persona');
    if(!select) return;
    
    select.innerHTML = '<option value="">Seleccione una persona...</option>';
    
    if (list.length === 0) {
        select.innerHTML += '<option value="" disabled>No hay personas disponibles</option>';
        return;
    }

    // Limitamos renderizado visual a 100 para no congelar UI
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
        option.textContent = `... y ${list.length - limit} más (use el buscador)`;
        select.appendChild(option);
    }
}

// Guardar Usuario
async function saveUser(e) {
    e.preventDefault();
    
    const roleId = document.getElementById('user-role').value;
    
    const payload = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        rol_id: roleId,
        persona_id: document.getElementById('user-persona').value,
    };

    // Si es Rol Empresa (3), adjuntar ID de empresa
    if(roleId == "3") {
        const empresaId = document.getElementById('user-empresa').value;
        if(!empresaId) return showNotification('warning', 'Falta Dato', 'Seleccione la empresa.');
        payload.empresa_id = empresaId;
    } else {
        payload.empresa_id = null;
    }
    
    const password = document.getElementById('user-password').value;
    if (password) payload.password = password;
    
    if (!editingUserId && !password) {
        return showNotification('warning', 'Atención', 'La contraseña es obligatoria para nuevos usuarios.');
    }

    let result;
    if (editingUserId) {
        result = await apiCall(`/users/${editingUserId}`, 'PUT', payload);
    } else {
        result = await apiCall('/users', 'POST', payload);
    }

    if(result && result.status) {
        showNotification('success', 'Éxito', 'Usuario guardado.');
        document.getElementById('modal-user').style.display = 'none';
        loadUsers();
    }
}

// Eliminar / Restaurar
window.deleteUser = async function(id) {
    if(!confirm('¿Eliminar usuario?')) return;
    const res = await apiCall(`/users/${id}`, 'DELETE');
    if(res && res.status) {
        showNotification('success', 'Eliminado', 'Usuario eliminado.');
        loadUsers();
    }
};

window.restoreUser = async function(id) {
    if(!confirm('¿Restaurar usuario?')) return;
    const res = await apiCall(`/users/${id}/rehabilitate`, 'POST');
    if(res && res.status) {
        showNotification('success', 'Restaurado', 'Usuario habilitado.');
        loadUsers();
    }
};

// --- GESTIÓN DE ROLES ---
async function loadRoles() {
    const container = document.getElementById('roles-table');
    container.innerHTML = '<div class="loading-state"><p>Cargando roles...</p></div>';
    const res = await apiCall('/rol');
    if (res && res.data) {
        adminStore.roles = res.data.data || res.data;
        renderRoles(adminStore.roles);
        setupSearch('search-roles', adminStore.roles, ['descripcion'], renderRoles);
    }
}

function renderRoles(data) {
    renderTable(data, [
        { header: 'ID', key: 'id' },
        { header: 'Descripción', key: 'descripcion' },
        { header: 'Acciones', render: (r) => `
            <div class="flex gap-2">
                <button onclick="openModalRole(${r.id}, '${r.descripcion}')" class="btn-action text-yellow-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                <button onclick="deleteRole(${r.id})" class="btn-action text-red-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
        `}
    ], 'roles-table');
}

window.openModalRole = function(id = null, desc = '') {
    editingRoleId = id;
    document.getElementById('modal-role').style.display = 'flex';
    document.getElementById('form-role').reset();
    document.getElementById('modal-role-title').textContent = id ? 'Editar Rol' : 'Crear Rol';
    if(id) document.getElementById('role-desc').value = desc;
};

async function saveRole(e) {
    e.preventDefault();
    const desc = document.getElementById('role-desc').value;
    const payload = { descripcion: desc };
    let result = editingRoleId ? await apiCall(`/rol/${editingRoleId}`, 'PUT', payload) : await apiCall('/rol', 'POST', payload);
    if(result && result.status) {
        showNotification('success', 'Éxito', 'Rol guardado.');
        document.getElementById('modal-role').style.display = 'none';
        loadRoles();
    }
}

window.deleteRole = async function(id) {
    if(!confirm('¿Eliminar rol?')) return;
    const res = await apiCall(`/rol/${id}`, 'DELETE');
    if(res && res.status) {
        showNotification('success', 'Eliminado', 'Rol eliminado.');
        loadRoles();
    }
};

// --- BÚSQUEDA ---
function setupSearch(inputId, dataList, keys, renderFn) {
    const input = document.getElementById(inputId);
    if(!input) return;
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    newInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = dataList.filter(item => keys.some(key => String(item[key]).toLowerCase().includes(term)));
        renderFn(filtered);
    });
}

// Configura el buscador específico para el select de personas
function setupPersonaFilter() {
    const input = document.getElementById('filter-persona-input');
    if (!input) return;

    input.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = adminStore.personas.filter(p => {
            const fullName = `${p.name} ${p.last_name}`.toLowerCase();
            const nui = String(p.nui);
            return fullName.includes(term) || nui.includes(term);
        });
        
        const currentSelect = document.getElementById('user-persona');
        const currentVal = currentSelect.value ? parseInt(currentSelect.value) : null;
        renderPersonasSelect(filtered, currentVal);
    });
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    buildAdminMenu();
    loadStats();
    document.getElementById('view-overview').style.display = 'block';

    document.getElementById('btn-add-user')?.addEventListener('click', () => openModalUser());
    document.getElementById('btn-add-role')?.addEventListener('click', () => openModalRole());
    document.getElementById('form-user')?.addEventListener('submit', saveUser);
    document.getElementById('form-role')?.addEventListener('submit', saveRole);
    document.getElementById('btn-cancel-user')?.addEventListener('click', () => document.getElementById('modal-user').style.display = 'none');
    document.getElementById('btn-cancel-role')?.addEventListener('click', () => document.getElementById('modal-role').style.display = 'none');
    
    document.getElementById('toggle-deleted-users')?.addEventListener('change', loadUsers);
    
    setupPersonaFilter();
});