/**
 * ============================================
 * ADMIN BASE MODULE (FINAL)
 * ============================================
 * Utilidades compartidas para el panel de administración.
 * Incluye: API calls, notificaciones, formateo de fechas y renderizado de tablas.
 */
const AdminBase = (function() {
    'use strict';

    // Configuración base
    const API_PREFIX = '/api';

    /**
     * Obtiene el token de autenticación
     */
    function getToken() {
        return localStorage.getItem('auth_token');
    }

    /**
     * Muestra notificaciones tipo Toast
     */
    function showNotification(type, title, message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const div = document.createElement('div');
        // Colores Tailwind según tipo
        const colors = {
            success: 'bg-green-100 border-green-500 text-green-700',
            error: 'bg-red-100 border-red-500 text-red-700',
            warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
            info: 'bg-blue-100 border-blue-500 text-blue-700'
        };

        div.className = `mb-4 p-4 rounded border-l-4 shadow-md flex justify-between items-start transition-all duration-500 ${colors[type] || colors.info}`;
        
        div.innerHTML = `
            <div>
                <h4 class="font-bold text-sm">${title}</h4>
                <p class="text-sm">${message}</p>
            </div>
            <button class="text-xl font-bold leading-none hover:opacity-50 ml-4 text-gray-500">&times;</button>
        `;
        
        // Listener para cerrar
        div.querySelector('button').onclick = () => div.remove();
        
        container.appendChild(div);
        
        // Auto eliminar a los 5 segundos
        setTimeout(() => {
            if(div && div.parentNode) div.remove();
        }, 5000);
    }

    /**
     * Formatea una fecha ISO (YYYY-MM-DD HH:mm:ss) a formato local legible.
     * @param {string} isoDate 
     * @returns {string} Fecha formateada o guion si es nula
     */
    function formatDate(isoDate) {
        if (!isoDate) return '-';
        try {
            const date = new Date(isoDate);
            // Formato local (ej: 25/11/2025 10:30)
            return date.toLocaleString('es-CO', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (e) {
            return isoDate; // Fallback si falla el parseo
        }
    }

    /**
     * Función Maestra para llamadas a la API
     * @param {string} endpoint - Ej: '/conductores'
     * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
     * @param {Object|FormData} data - Datos a enviar (Body) o Parámetros (si es GET)
     */
    async function apiCall(endpoint, method = 'GET', data = null) {
        const token = getToken();
        let url = `${API_PREFIX}${endpoint}`;
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };

        const config = { method, headers };

        // Manejo de parámetros GET (Query String)
        if (method === 'GET' && data) {
            const params = new URLSearchParams();
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    params.append(key, data[key]);
                }
            });
            url += `?${params.toString()}`;
        } 
        // Manejo de Body (POST/PUT)
        else if (data) {
            if (data instanceof FormData) {
                // Si es FormData, NO ponemos Content-Type (el navegador lo gestiona)
                config.body = data;
            } else {
                // Si es JSON normal
                headers['Content-Type'] = 'application/json';
                config.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, config);
            const json = await response.json();

            if (!response.ok) {
                // Manejo específico de errores de validación Laravel (422)
                if (response.status === 422 && json.errors) {
                    // Concatenar todos los mensajes de error en un solo string
                    const errorMsg = Object.values(json.errors).flat().join('\n');
                    throw new Error(errorMsg);
                }
                throw new Error(json.message || `Error ${response.status}`);
            }

            return json;
        } catch (error) {
            console.error('API Error:', error);
            showNotification('error', 'Error de Operación', error.message);
            return null; // Retorna null para indicar fallo
        }
    }

    /**
     * Renderiza una tabla HTML estándar con Tailwind CSS
     */
    function renderTable(data, columns, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="p-6 text-center text-gray-500 bg-gray-50 rounded border border-dashed">No hay registros para mostrar.</div>';
            return;
        }

        let html = `
            <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
                    <thead class="bg-gray-50">
                        <tr>`;
        
        // Headers
        columns.forEach(col => {
            html += `<th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">${col.header}</th>`;
        });

        html += `</tr></thead><tbody class="divide-y divide-gray-200">`;

        // Rows
        data.forEach(row => {
            const rowClass = row.deleted_at ? 'bg-red-50' : 'hover:bg-gray-50';
            html += `<tr class="${rowClass} transition-colors duration-150">`;
            
            columns.forEach(col => {
                // Si hay función render, la usa, si no, usa la key directa
                const val = col.render ? col.render(row) : (row[col.key] || '-');
                html += `<td class="px-4 py-3 text-gray-700 whitespace-nowrap">${val}</td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;
    }

    /**
     * Genera botones de acción (Editar/Eliminar/Restaurar) con SVGs
     * Requiere que el módulo tenga funciones públicas openModal, destroy y restore.
     */
    function generateActionButtons(row, moduleName) {
        // Si el registro está eliminado (Soft Deleted), mostramos el botón de Restaurar con SVG
        if (row.deleted_at) {
            return `
                <button onclick="${moduleName}.restore(${row.id})" 
                        class="text-green-600 hover:text-green-800 font-semibold text-xs flex items-center gap-1 transition-colors duration-200" 
                        title="Restaurar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Restaurar
                </button>`;
        }
        
        // Si el registro está activo, mostramos Editar y Eliminar
        return `
            <div class="flex gap-3">
                <button onclick="${moduleName}.openModal(${row.id})" class="text-yellow-600 hover:text-yellow-800 transition-colors duration-200" title="Editar">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button onclick="${moduleName}.destroy(${row.id})" class="text-red-600 hover:text-red-800 transition-colors duration-200" title="Eliminar">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
    }

    // EXPORTAR API PÚBLICA
    return {
        getToken,
        showNotification,
        apiCall,
        renderTable,
        generateActionButtons,
        formatDate // <--- ¡Ahora sí está incluida!
    };
})();

// Exportar al objeto global window para que otros scripts lo usen
window.AdminBase = AdminBase;