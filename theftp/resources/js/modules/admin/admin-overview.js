/**
 * ============================================
 * ADMIN OVERVIEW MODULE
 * ============================================
 * Carga y renderiza las tarjetas de resumen/estadísticas del panel admin.
 * Depende de: AdminBase (window.AdminBase)
 */

async function loadStats() {
    try {
        const [users, roles, audits] = await Promise.all([
            AdminBase.apiCall('/users', 'GET', { limit: 1 }),
            AdminBase.apiCall('/rol', 'GET', { limit: 1 }),
            AdminBase.apiCall('/auditoria', 'GET', { limit: 1 })
        ]);

        const container = document.getElementById('admin-stats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Usuarios</p>
                        <p class="text-2xl font-bold text-gray-900">${users?.total || 0}</p>
                    </div>
                </div>
            </div>
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Roles</p>
                        <p class="text-2xl font-bold text-gray-900">${roles?.total || 0}</p>
                    </div>
                </div>
            </div>
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Auditoría</p>
                        <p class="text-2xl font-bold text-gray-900">${audits?.total || 0}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Error cargando estadísticas:', e);
    }
}

window.loadStats = loadStats;

// ============================================================
// admin-init.js - Punto de entrada del panel admin
// ============================================================
// ORDEN DE CARGA REQUERIDO EN BLADE (scripts en este orden):
//   1. admin-base.js        (AdminBase - utilidades compartidas)
//   2. admin-nav.js         (menu + navegacion)
//   3. admin-overview.js    (estadisticas + este init al final)
//   4. admin-users.js
//   5. admin-roles.js
//   6. admin-conductores.js
//   7. admin-vehiculos.js
//   8. admin-empresas.js
//   9. admin-propietarios.js
//  10. admin-rutas.js
//  11. admin-documentos.js
//  12. admin-licencias.js
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

    // 1. Construir menu lateral
    if (typeof buildAdminMenu === 'function') buildAdminMenu();

    // 2. Mostrar vista inicial (overview)
    var overviewView = document.getElementById('view-overview');
    if (overviewView) overviewView.style.display = 'block';
    if (typeof loadStats === 'function') loadStats();

    // 3. Botones de usuarios
    var btnAddUser = document.getElementById('btn-add-user');
    if (btnAddUser) btnAddUser.addEventListener('click', function() { openModalUser(); });
    var formUser = document.getElementById('form-user');
    if (formUser) formUser.addEventListener('submit', saveUser);
    var btnCancelUser = document.getElementById('btn-cancel-user');
    if (btnCancelUser) btnCancelUser.addEventListener('click', function() {
        document.getElementById('modal-user').style.display = 'none';
    });
    var toggleDeletedUsers = document.getElementById('toggle-deleted-users');
    if (toggleDeletedUsers) toggleDeletedUsers.addEventListener('change', loadUsers);

    // 4. Botones de roles
    var btnAddRole = document.getElementById('btn-add-role');
    if (btnAddRole) btnAddRole.addEventListener('click', function() { openModalRole(); });
    var formRole = document.getElementById('form-role');
    if (formRole) formRole.addEventListener('submit', saveRole);
    var btnCancelRole = document.getElementById('btn-cancel-role');
    if (btnCancelRole) btnCancelRole.addEventListener('click', function() {
        document.getElementById('modal-role').style.display = 'none';
    });

    // 5. Buscador de personas en el modal de usuario
    if (typeof setupPersonaFilter === 'function') setupPersonaFilter();

    console.log('Panel Admin inicializado correctamente.');
});