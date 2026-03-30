// app-permissions.js
// Lógica para verificar permisos en el Frontend (CRUD)

/**
 * Verifica si el usuario actual tiene permiso para una acción en una tabla.
 * @param {string} tabla - Nombre de la tabla (ej: 'vehiculo', 'conductores')
 * @param {string} accion - 'create', 'read', 'update', 'delete', 'restore'
 * @returns {boolean}
 */
window.hasPermission = function(tabla, accion) {
    const roleId = sessionStorage.getItem('user_role_id');
    
    // El Admin (1) y Subadmin (6) siempre tienen permiso para todo en el frontend
    if (roleId === '1' || roleId === '6') return true;

    const permissionsRaw = sessionStorage.getItem('user_permissions');
    if (!permissionsRaw) {
        // Si no hay permisos, por defecto no permitimos nada excepto lectura si es un rol conocido
        if (accion === 'read') return true; 
        return false;
    }

    try {
        const permissions = JSON.parse(permissionsRaw);
        
        // El seeder usa nombres de tablas en minúscula.
        // Mapeo manual si hay discrepancias entre lo que el seeder inserta y el enum Tablas.
        // En PermisosSeeder.php se usa Tablas::getValues().
        
        const perm = permissions.find(p => p.tabla === tabla);
        if (!perm) {
            // Caso especial: si la tabla no está en el mapa, denegamos acción por seguridad
            // menos para lectura básica.
            return accion === 'read';
        }

        // Las columnas en la tabla 'permisos' son booleanos: create, read, update, delete, restore
        // En JS, el valor 1 es true.
        return !!perm[accion];
    } catch (e) {
        console.error('Error al verificar permisos:', e);
        return false;
    }
};

window.canCreate = (tabla) => window.hasPermission(tabla, 'create');
window.canRead   = (tabla) => window.hasPermission(tabla, 'read');
window.canUpdate = (tabla) => window.hasPermission(tabla, 'update');
window.canDelete = (tabla) => window.hasPermission(tabla, 'delete');
window.canRestore = (tabla) => window.hasPermission(tabla, 'restore');
