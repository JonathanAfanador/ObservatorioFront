<x-layouts.dashboard>

    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

    <div id="view-overview" class="dashboard-view">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Panel de Administración</h2>
        
        <div class="stat-grid" id="admin-stats">
            <div class="loading-state"><p>Cargando estadísticas...</p></div>
        </div>
    </div>

    <div id="view-users" class="dashboard-view" style="display: none;">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
            
            <div class="flex items-center gap-4">
                <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition">
                    <input type="checkbox" id="toggle-deleted-users" class="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
                    <span class="text-sm font-medium text-gray-700 select-none">Ver Eliminados</span>
                </label>

                <button id="btn-add-user" class="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Nuevo Usuario
                </button>
            </div>
        </div>

        <div class="content-card mb-6">
            <div class="flex justify-end mb-4">
                <div class="relative">
                    <input type="text" id="search-users" placeholder="Buscar por nombre o email..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64 shadow-sm">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            <div id="users-table">
                <div class="loading-state"><p>Cargando usuarios...</p></div>
            </div>
        </div>
    </div>

    <div id="view-roles" class="dashboard-view" style="display: none;">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
            <button id="btn-add-role" class="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo Rol
            </button>
        </div>

        <div class="content-card">
            <div class="flex justify-end mb-4">
                <div class="relative">
                    <input type="text" id="search-roles" placeholder="Buscar rol..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64 shadow-sm">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            <div id="roles-table">
                <div class="loading-state"><p>Cargando roles...</p></div>
            </div>
        </div>
    </div>

    <div id="modal-user" class="modal-overlay" style="display: none;">
        <div class="modal-content shadow-2xl transform transition-all scale-100">
            <h3 class="modal-title text-lg font-semibold text-gray-900" id="modal-user-title">Nuevo Usuario</h3>
            <form id="form-user" class="flex flex-col gap-4 mt-4">
                <input type="hidden" id="user-id">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="user-name" class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input type="text" id="user-name" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="form-group">
                        <label for="user-email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input type="email" id="user-email" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="user-password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input type="password" id="user-password" placeholder="(Opcional al editar)" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="form-group">
                        <label for="user-role" class="block text-sm font-medium text-gray-700 mb-1">Rol Asignado</label>
                        <select id="user-role" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Cargando roles...</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="user-persona" class="block text-sm font-medium text-gray-700 mb-1">Persona Asociada</label>
                 <div class="relative mb-2">
                <input type="text" id="filter-persona-input" placeholder=" Escribe para buscar nombre o NUI..." 
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                        </div>

                        <select id="user-persona" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="">Cargando personas...</option>
                        </select>
                        
                        <small class="text-xs text-gray-500 mt-1 block">
                            Busque y seleccione la persona física de la lista.
                        </small>
                    </div>
                
                <div class="modal-actions flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button type="button" class="btn-secondary px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50" id="btn-cancel-user">Cancelar</button>
                    <button type="submit" class="btn-primary px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <div id="modal-role" class="modal-overlay" style="display: none;">
        <div class="modal-content shadow-2xl transform transition-all scale-100" style="max-width: 400px;">
            <h3 class="modal-title text-lg font-semibold text-gray-900" id="modal-role-title">Nuevo Rol</h3>
            <form id="form-role" class="flex flex-col gap-4 mt-4">
                <input type="hidden" id="role-id">
                <div class="form-group">
                    <label for="role-desc" class="block text-sm font-medium text-gray-700 mb-1">Descripción del Rol</label>
                    <input type="text" id="role-desc" required placeholder="Ej: Auditor" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="modal-actions flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button type="button" class="btn-secondary px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50" id="btn-cancel-role">Cancelar</button>
                    <button type="submit" class="btn-primary px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    @vite('resources/js/dashboard-admin.js')

</x-layouts.dashboard>