<x-layouts.dashboard>

    {{-- Contenedor global de notificaciones para el dashboard de administración --}}
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

    {{-- Vista principal del panel de administración (overview) --}}
    <div id="view-overview" class="dashboard-view">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Panel de Administración</h2>

        {{-- Grid donde se cargan las tarjetas de estadísticas (usuarios, roles, etc.) --}}
        <div class="stat-grid" id="admin-stats">
            <div class="loading-state"><p>Cargando estadísticas...</p></div>
        </div>
    </div>

    {{-- Vista de gestión de usuarios (listado, búsqueda, alta/baja) --}}
    <div id="view-users" class="dashboard-view" style="display: none;">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>

            <div class="flex items-center gap-4">
                {{-- Checkbox para alternar entre usuarios activos y eliminados (soft delete) --}}
                <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition">
                    <input type="checkbox" id="toggle-deleted-users" class="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
                    <span class="text-sm font-medium text-gray-700 select-none">Ver Eliminados</span>
                </label>

                {{-- Botón para abrir el modal de creación de nuevo usuario --}}
                <button id="btn-add-user" class="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Nuevo Usuario
                </button>
            </div>
        </div>

        <div class="content-card mb-6">
            {{-- Barra de búsqueda de usuarios por nombre o correo --}}
            <div class="flex justify-end mb-4">
                <div class="relative">
                    <input type="text" id="search-users" placeholder="Buscar por nombre o email..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64 shadow-sm">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            {{-- Contenedor donde se pinta la tabla de usuarios --}}
            <div id="users-table">
                <div class="loading-state"><p>Cargando usuarios...</p></div>
            </div>
        </div>
    </div>

    {{-- Vista de gestión de roles (alta, edición, eliminación) --}}
    <div id="view-roles" class="dashboard-view" style="display: none;">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
            {{-- Botón para abrir el modal de creación de rol --}}
            <button id="btn-add-role" class="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo Rol
            </button>
        </div>

        <div class="content-card">
            {{-- Campo de búsqueda para filtrar roles por descripción --}}
            <div class="flex justify-end mb-4">
                <div class="relative">
                    <input type="text" id="search-roles" placeholder="Buscar rol..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64 shadow-sm">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            {{-- Contenedor de la tabla de roles --}}
            <div id="roles-table">
                <div class="loading-state"><p>Cargando roles...</p></div>
            </div>
        </div>
    </div>

    {{-- Modal para crear/editar usuarios del sistema --}}
    <div id="modal-user" class="modal-overlay" style="display: none;">
        <div class="modal-content shadow-2xl transform transition-all scale-100">
            <h3 class="modal-title text-lg font-semibold text-gray-900" id="modal-user-title">Nuevo Usuario</h3>
            <form id="form-user" class="flex flex-col gap-4 mt-4">
                <input type="hidden" id="user-id">

                {{-- Datos básicos del usuario (nombre y correo) --}}
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

                {{-- Contraseña y rol asociado --}}
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
                
                <div class="form-group" id="group-user-empresa" style="display: none;">
                    <label for="user-empresa" class="text-blue-600 font-semibold">Empresa a la que pertenece</label>
                    <select id="user-empresa" class="border-blue-300 bg-blue-50">
                        <option value="">Seleccione la empresa...</option>
                    </select>
                    <small class="text-gray-500">Este usuario gestionará los datos de esta empresa.</small>
                </div>

                {{-- Asociación con una persona del registro (persona física) --}}
                <div class="form-group">
                    <label for="user-persona" class="block text-sm font-medium text-gray-700 mb-1">Persona Asociada</label>
                    <div class="relative mb-2">
                        {{-- Input para filtrar rápidamente la lista de personas por nombre o NUI --}}
                        <input type="text" id="filter-persona-input" placeholder=" Escribe para buscar nombre o NUI..."
                            class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                    </div>

                    {{-- Select con todas las personas disponibles --}}
                    <select id="user-persona" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Cargando personas...</option>
                    </select>

                    <small class="text-xs text-gray-500 mt-1 block">
                        Busque y seleccione la persona física de la lista.
                    </small>
                </div>

                {{-- Botones de acción del modal de usuario --}}
                <div class="modal-actions flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button type="button" class="btn-secondary px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50" id="btn-cancel-user">Cancelar</button>
                    <button type="submit" class="btn-primary px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Modal para crear/editar roles --}}
    <div id="modal-role" class="modal-overlay" style="display: none;">
        <div class="modal-content shadow-2xl transform transition-all scale-100" style="max-width: 400px;">
            <h3 class="modal-title text-lg font-semibold text-gray-900" id="modal-role-title">Nuevo Rol</h3>
            <form id="form-role" class="flex flex-col gap-4 mt-4">
                <input type="hidden" id="role-id">
                <div class="form-group">
                    <label for="role-desc" class="block text-sm font-medium text-gray-700 mb-1">Descripción del Rol</label>
                    <input type="text" id="role-desc" required placeholder="Ej: Auditor" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                </div>
                {{-- Acciones del modal de roles --}}
                <div class="modal-actions flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button type="button" class="btn-secondary px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50" id="btn-cancel-role">Cancelar</button>
                    <button type="submit" class="btn-primary px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">Guardar</button>
                </div>
            </form>
        </div>
    </div>
{{-- VISTA CONDUCTORES --}}
<div id="view-conductores" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Conductores</h2>
        <div class="flex items-center gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300 shadow-sm hover:bg-gray-50">
                <input type="checkbox" id="toggle-deleted-conductores" class="form-checkbox h-4 w-4 text-blue-600">
                <span class="text-sm font-medium text-gray-700">Ver Eliminados</span>
            </label>
            
            <button id="btn-add-conductor" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 transition">
                <span class="font-bold">+</span> Nuevo Conductor
            </button>
        </div>
    </div>

    <div class="content-card bg-white p-4 rounded-lg shadow border border-gray-200">
        <div id="conductores-table"></div>
    </div>
</div>

{{-- MODAL CONDUCTOR --}}
<div id="modal-conductor" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900" id="modal-conductor-title">Gestionar Conductor</h3>
        </div>

        <form id="form-conductor" class="px-6 py-4">
            <div class="form-group mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Persona (Filtro)</label>
                <input type="text" id="search-persona-modal" placeholder="Escriba nombre o NUI..." 
                       class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2 mb-2 bg-gray-50">
                
                <label for="conductor-persona" class="block text-sm font-medium text-gray-700 mb-1">Seleccionar:</label>
                <select id="conductor-persona" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white h-10">
                    <option value="">Cargando lista...</option>
                </select>
                <p class="text-xs text-gray-500 mt-2">
                    * Seleccione la persona física que será registrada como conductor.
                </p>
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button type="button" id="btn-cancel-conductor" class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
                    Guardar
                </button>
            </div>
        </form>
    </div>
</div>
{{-- VISTA VEHÍCULOS --}}
<div id="view-vehiculos" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Parque Automotor (Vehículos)</h2>
        <div class="flex items-center gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300 shadow-sm hover:bg-gray-50">
                <input type="checkbox" id="toggle-deleted-vehiculos" class="form-checkbox h-4 w-4 text-blue-600">
                <span class="text-sm font-medium text-gray-700">Ver Eliminados</span>
            </label>
            
            <button id="btn-add-vehiculo" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 transition flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Nuevo Vehículo
            </button>
        </div>
    </div>

    <div class="content-card bg-white p-4 rounded-lg shadow border border-gray-200">
        <div id="vehiculos-table"></div>
    </div>
</div>

{{-- MODAL VEHÍCULO --}}
<div id="modal-vehiculo" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900" id="modal-vehiculo-title">Gestión de Vehículo</h3>
        </div>

        <form id="form-vehiculo" class="px-6 py-4 flex flex-col gap-4">
            {{-- Fila 1: Placa y Marca --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="vehiculo-placa" class="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                    <input type="text" id="vehiculo-placa" required placeholder="Ej: ABC-123" 
                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm uppercase">
                </div>
                <div class="form-group">
                    <label for="vehiculo-marca" class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input type="text" id="vehiculo-marca" required 
                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                </div>
            </div>

            {{-- Fila 2: Modelo y Color --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="vehiculo-modelo" class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <input type="text" id="vehiculo-modelo" required placeholder="Ej: 2024" 
                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                </div>
                <div class="form-group">
                    <label for="vehiculo-color" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input type="text" id="vehiculo-color" required 
                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                </div>
            </div>

            {{-- Fila 3: Relaciones --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="vehiculo-tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo</label>
                    <select id="vehiculo-tipo" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Cargando...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="vehiculo-propietario" class="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
                    <select id="vehiculo-propietario" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Cargando...</option>
                    </select>
                </div>
            </div>

            {{-- Servicio --}}
            <div class="form-group flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <input type="checkbox" id="vehiculo-servicio" class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                <label for="vehiculo-servicio" class="text-sm font-medium text-gray-700 cursor-pointer">
                    ¿Este vehículo presta Servicio Público?
                </label>
            </div>

            <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" id="btn-cancel-vehiculo" class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
                    Guardar Vehículo
                </button>
            </div>
        </form>
    </div>
</div>
{{-- VISTA PROPIETARIOS --}}
<div id="view-propietarios" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Propietarios</h2>
        <div class="flex items-center gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300 shadow-sm">
                <input type="checkbox" id="toggle-deleted-propietarios" class="form-checkbox h-4 w-4 text-blue-600">
                <span class="text-sm font-medium text-gray-700">Ver Eliminados</span>
            </label>
            <button id="btn-add-propietario" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700">
                + Nuevo Propietario
            </button>
        </div>
    </div>
    <div class="content-card bg-white p-4 rounded-lg shadow border border-gray-200">
        <div id="propietarios-table"></div>
    </div>
</div>

{{-- ======================================================================== --}}
    {{-- SECCIÓN PROPIETARIOS  --}}
    {{-- ======================================================================== --}}

    {{-- 1. VISTA (TABLA) --}}
    <div id="view-propietarios" class="dashboard-view" style="display: none;">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Propietarios</h2>
            <div class="flex items-center gap-4">
                <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300 shadow-sm hover:bg-gray-50">
                    <input type="checkbox" id="toggle-deleted-propietarios" class="form-checkbox h-4 w-4 text-blue-600">
                    <span class="text-sm font-medium text-gray-700 select-none">Ver Eliminados</span>
                </label>
                
                <button id="btn-add-propietario" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 transition flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Nuevo Propietario
                </button>
            </div>
        </div>

        <div class="content-card bg-white p-4 rounded-lg shadow border border-gray-200">
            {{-- Aquí el JS pintará la tabla --}}
            <div id="propietarios-table"></div>
        </div>
    </div>

    {{-- 2. MODAL (FORMULARIO) --}}
    <div id="modal-propietario" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4" id="modal-propietario-title">Propietario</h3>
            
            <form id="form-propietario" class="flex flex-col gap-4">
                
                {{-- Buscador de personas dentro del modal --}}
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Persona (Dueño)</label>
                    <input type="text" id="search-persona-propietario" placeholder="Filtrar por nombre o documento..." 
                           class="w-full border-gray-300 rounded-md text-sm px-3 py-2 mb-1 bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
                    
                    <select id="propietario-persona" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Cargando lista...</option>
                    </select>
                </div>

                {{-- Select de Documento Soporte --}}
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Documento Soporte</label>
                    <select id="propietario-documento" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Cargando lista...</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">Seleccione el documento legal asociado.</p>
                </div>

                {{-- Fecha Registro --}}
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                    <input type="datetime-local" id="propietario-fecha" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div class="modal-actions flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button type="button" id="btn-cancel-propietario" class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm">Guardar</button>
                </div>
            </form>
        </div>
    </div>
{{-- VISTA EMPRESAS --}}
<div id="view-empresas" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Directorio de Empresas</h2>
        <div class="flex items-center gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300 shadow-sm hover:bg-gray-50">
                <input type="checkbox" id="toggle-deleted-empresas" class="form-checkbox h-4 w-4 text-blue-600">
                <span class="text-sm font-medium text-gray-700">Ver Eliminadas</span>
            </label>
            <button id="btn-add-empresa" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 transition flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Nueva Empresa
            </button>
        </div>
    </div>
    <div class="content-card bg-white p-4 rounded-lg shadow border border-gray-200">
        <div id="empresas-table"></div>
    </div>
</div>

{{-- MODAL EMPRESA --}}
<div id="modal-empresa" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all">
        <h3 class="text-lg font-semibold text-gray-900 mb-4" id="modal-empresa-title">Nueva Empresa</h3>
        <form id="form-empresa" class="flex flex-col gap-4">
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input type="text" id="empresa-nit" required placeholder="Ej: 900.123.456-7" 
                       class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-1">Razón Social (Nombre)</label>
                <input type="text" id="empresa-name" required 
                       class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Empresa</label>
                <select id="empresa-tipo" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Cargando...</option>
                </select>
            </div>
            <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" id="btn-cancel-empresa" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">Guardar</button>
            </div>
        </form>
    </div>
</div>
{{-- VISTA RUTAS --}}
<div id="view-rutas" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Rutas</h2>
        <div class="flex gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300">
                <input type="checkbox" id="toggle-deleted-rutas" class="form-checkbox text-blue-600">
                <span class="text-sm">Ver Eliminados</span>
            </label>
            <button id="btn-add-ruta" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow">+ Nueva Ruta</button>
        </div>
    </div>
    <div id="rutas-table" class="bg-white p-4 rounded shadow"></div>
</div>

{{-- MODAL RUTA --}}
<div id="modal-ruta" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4" id="modal-ruta-title">Nueva Ruta</h3>
        <form id="form-ruta" class="flex flex-col gap-4">
            <div class="form-group">
                <label class="block text-sm font-medium">Nombre Ruta</label>
                <input type="text" id="ruta-name" required class="w-full border-gray-300 rounded">
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium">Empresa</label>
                <select id="ruta-empresa" required class="w-full border-gray-300 rounded"></select>
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium">Archivo (GeoJSON/KML)</label>
                <input type="file" id="ruta-file" class="w-full text-sm">
                <small id="ruta-file-help" class="text-gray-500"></small>
            </div>
            <div class="flex justify-end gap-3 mt-4">
                <button type="button" id="btn-cancel-ruta" class="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
            </div>
        </form>
    </div>
</div>

{{-- VISTA DOCUMENTOS --}}
<div id="view-documentos" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Documentos Legales</h2>
        <div class="flex gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300">
                <input type="checkbox" id="toggle-deleted-documentos" class="form-checkbox text-blue-600">
                <span class="text-sm">Ver Eliminados</span>
            </label>
            <button id="btn-add-documento" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow">+ Nuevo Doc</button>
        </div>
    </div>
    <div id="documentos-table" class="bg-white p-4 rounded shadow"></div>
</div>

{{-- MODAL DOCUMENTO --}}
<div id="modal-documento" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4" id="modal-documento-title">Documento</h3>
        <form id="form-documento" class="flex flex-col gap-4">
            <div class="form-group">
                <label class="block text-sm font-medium">Tipo Documento</label>
                <select id="documento-tipo" required class="w-full border-gray-300 rounded"></select>
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium">Observaciones</label>
                <textarea id="documento-obs" required class="w-full border-gray-300 rounded"></textarea>
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium">Archivo</label>
                <input type="file" id="documento-file" class="w-full text-sm">
                <small id="documento-file-help" class="text-gray-500"></small>
            </div>
            <div class="flex justify-end gap-3 mt-4">
                <button type="button" id="btn-cancel-documento" class="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
            </div>
        </form>
    </div>
</div>

{{-- VISTA LICENCIAS --}}
<div id="view-licencias" class="dashboard-view" style="display: none;">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Licencias de Conducción</h2>
        <div class="flex gap-4">
            <label class="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-300">
                <input type="checkbox" id="toggle-deleted-licencias" class="form-checkbox text-blue-600">
                <span class="text-sm">Ver Eliminados</span>
            </label>
            <button id="btn-add-licencia" class="btn-primary px-4 py-2 rounded bg-blue-600 text-white shadow">+ Nueva Licencia</button>
        </div>
    </div>
    <div id="licencias-table" class="bg-white p-4 rounded shadow"></div>
</div>

{{-- MODAL LICENCIA --}}
<div id="modal-licencia" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4" id="modal-licencia-title">Licencia</h3>
        <form id="form-licencia" class="flex flex-col gap-4">
            <div class="form-group">
                <label class="block text-sm font-medium">Categoría</label>
                <select id="licencia-categoria" required class="w-full border-gray-300 rounded"></select>
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium">Restricción</label>
                <select id="licencia-restriccion" required class="w-full border-gray-300 rounded"></select>
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium">Documento Asociado</label>
                <select id="licencia-documento" required class="w-full border-gray-300 rounded"></select>
            </div>
            <div class="flex justify-end gap-3 mt-4">
                <button type="button" id="btn-cancel-licencia" class="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
            </div>
        </form>
    </div>
</div>

    {{-- ======================================================================== --}}
    {{-- INCLUSIÓN DE SCRIPTS ESPECÍFICOS DEL DASHBOARD DE ADMINISTRACIÓN --}}
    {{-- ======================================================================== --}}

    {{-- Carga el JavaScript principal del dashboard de administración --}}
    @vite('resources/js/dashboard-admin.js')
    @vite('resources/js/modules/admin/admin-base.js')
    @vite('resources/js/modules/admin/admin-empresas.js')
    @vite('resources/js/modules/admin/admin-conductores.js')
    @vite('resources/js/modules/admin/admin-documentos.js')
    @vite('resources/js/modules/admin/admin-vehiculos.js')
    @vite('resources/js/modules/admin/admin-propietarios.js')
    @vite('resources/js/modules/admin/admin-rutas.js')
    @vite('resources/js/modules/admin/admin-licencias.js')


</x-layouts.dashboard>
