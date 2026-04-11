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
     * Lee una cookie del navegador
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
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
    async function apiCall(endpoint, method = 'GET', data = null, retries = 3) {
        const csrfToken = getCookie('XSRF-TOKEN');
        let url = `${API_PREFIX}${endpoint}`;
        
        const headers = {
            'Accept': 'application/json'
        };
        if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }

        const config = { method, headers, credentials: 'same-origin' };

        // Manejo de parámetros GET (Query String)
        if (method === 'GET' && data) {
            const params = new URLSearchParams();
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    params.append(key, data[key]);
                }
            });
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${params.toString()}`;
        } 
        // Manejo de Body (POST/PUT)
        else if (data) {
            if (data instanceof FormData) {
                config.body = data;
            } else {
                headers['Content-Type'] = 'application/json';
                config.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, config);
            
            // Si la respuesta es 404 o similar pero JSON
            const json = await response.json();

            if (!response.ok) {
                if (response.status === 422 && json.errors) {
                    const errorMsg = Object.values(json.errors).flat().join('\n');
                    throw new Error(errorMsg);
                }
                throw new Error(json.message || `Error ${response.status}`);
            }

            return json;
        } catch (error) {
            // Lógica de Reintento para errores de red (ERR_NETWORK_CHANGED, Failed to fetch, etc)
            if (retries > 0 && (error instanceof TypeError || error.name === 'AbortError' || error.message.includes('fetch'))) {
                console.warn(`Error de red detectado. Reintentando... (${retries} restantes) para ${endpoint}`);
                await new Promise(res => setTimeout(res, 1000)); // Esperar 1s antes de reintentar
                return apiCall(endpoint, method, data, retries - 1);
            }

            console.error('API Error:', error);
            showNotification('error', 'Error de Operación', error.message);
            return null;
        }
    }

    /**
     * REGISTRO INTERNO DE ESTADO PARA PAGINACIÓN
     */
    const tableRegistry = {};

    /**
     * Renderiza una tabla HTML con Paginación Automática y Diseño Premium
     * @param {Array} data - El arreglo completo de datos
     * @param {Array} columns - Definición de columnas
     * @param {string} containerId - ID del contenedor DOM
     * @param {number} perPage - Registros por página (default 10)
     * @param {Object} options - Opciones adicionales (ej: { hideGlobalSearch: true })
     */
    function renderTable(data, columns, containerId, perPage = 10, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 shadow-inner">No hay registros disponibles en este módulo.</div>';
            return;
        }

        // Ordenar datos: El más reciente primero (ID descendente)
        const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));

        // Registrar o actualizar el estado de esta tabla
        tableRegistry[containerId] = {
            data: sortedData,
            columns: columns,
            perPage: perPage,
            currentPage: 1,
            filters: {}, // Inicializamos filtros vacíos
            options: options // Guardamos opciones
        };

        // Renderizar la página inicial
        renderTablePage(containerId);
    }

    /**
     * Renderiza una página específica en base al registro
     */
    function renderTablePage(containerId) {
        const container = document.getElementById(containerId);
        const state = tableRegistry[containerId];
        if (!container || !state) return;

        const { data, columns, perPage, currentPage, filters } = state;
        
        // 1. Aplicar lógica de Filtrado Profesional (Búsqueda Global + Categorías)
        const globalTerm = (state.globalSearch || '').toLowerCase().trim();
        
        const filteredData = data.filter(row => {
            // A. Búsqueda Global (Smart Search)
            if (globalTerm) {
                const matchesGlobal = columns.some(col => {
                    if (col.filterOptions) return false; // Las categorías se filtran aparte
                    const cellContent = col.render ? col.render(row) : (row[col.key] || '');
                    const cleanText = String(cellContent).replace(/<[^>]*>?/gm, '').toLowerCase();
                    return cleanText.includes(globalTerm);
                });
                if (!matchesGlobal) return false;
            }

            // B. Filtros de Categoría (AND multidimensional)
            return Object.keys(filters).every(colIndex => {
                const term = filters[colIndex].toLowerCase().trim();
                if (!term) return true;

                const column = columns[colIndex];
                const cellContent = column.render ? column.render(row) : (row[column.key] || '');
                const cleanText = String(cellContent).replace(/<[^>]*>?/gm, '').toLowerCase();

                // Para selectores en toolbar, buscamos coincidencia exacta o inclusiva
                return cleanText.includes(term);
            });
        });

        const total = filteredData.length;
        const totalPages = Math.ceil(total / perPage);
        
        const start = (currentPage - 1) * perPage;
        const paginatedData = filteredData.slice(start, start + perPage);

        // --- CONSTRUCCIÓN DEL TOOLBAR PROFESIONAL ---
        let toolbarHtml = '';
        
        if (!state.options?.hideGlobalSearch) {
            toolbarHtml = `
                <div class="admin-toolbar flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
                    <div class="flex-1 relative group">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input type="text" 
                               id="${containerId}-search-input"
                               placeholder="Búsqueda global..." 
                               value="${state.globalSearch || ''}"
                               oninput="AdminBase.applyGlobalSearch('${containerId}', this.value)"
                               class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-800 transition-all duration-300 outline-none text-sm font-medium placeholder-slate-400 shadow-inner">
                    </div>
                
                    <div class="flex flex-wrap items-center gap-2 sm:gap-3">`;
        } else {
            // Si el buscador global está oculto, renderizamos un contenedor minimalista solo para los selectores
            const hasSelectors = columns.some(col => col.filterOptions);
            if (hasSelectors) {
                toolbarHtml = `
                    <div class="admin-toolbar flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3 mb-6">`;
            }
        }

        // Añadir Selectores de Categoría al Toolbar
        columns.forEach((col, idx) => {
            if (col.filterOptions) {
                const currentVal = filters[idx] || '';
                let optionsHtml = `<option value="">${col.header} (Todos)</option>`;
                col.filterOptions.forEach(opt => {
                    const optVal = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    const selected = currentVal.toLowerCase() === optVal.toLowerCase() ? 'selected' : '';
                    optionsHtml += `<option value="${optVal}" ${selected}>${optLabel}</option>`;
                });

                toolbarHtml += `
                    <select onchange="AdminBase.applyFilter('${containerId}', ${idx}, this.value)"
                            class="flex-1 sm:flex-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-tight focus:ring-4 focus:ring-slate-100 focus:border-slate-800 transition-all duration-200 outline-none cursor-pointer shadow-sm">
                        ${optionsHtml}
                    </select>`;
            }
        });

        // Botón Limpiar (Solo si hay filtros activos)
        const hasFilters = globalTerm || Object.keys(filters).length > 0;
        if (hasFilters) {
            toolbarHtml += `
                <button onclick="AdminBase.clearFilters('${containerId}')" 
                        class="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group" 
                        title="Limpiar filtros">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>`;
        }

        toolbarHtml += `</div>`;
        if (!state.options?.hideGlobalSearch) toolbarHtml += `</div>`;

        // 1. Contador Premium (Responsivo)
        const countHtml = `
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 px-1">
                <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                   <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span class="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronización Activa</span>
                </div>
                <div class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight">
                    Auditando <span class="text-slate-900">${start + 1}-${Math.min(start + perPage, total)}</span> <span class="mx-1 text-slate-200">/</span> Total <span class="text-slate-900">${total}</span> registros
                </div>
            </div>
        `;

        // 2. Tabla Estilizada (Sin buscadores en el header)
        let html = toolbarHtml + countHtml + `
            <div class="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 bg-white mb-6">
                <table class="min-w-full divide-y divide-gray-100 text-sm">
                    <thead class="bg-slate-50/50">
                        <tr>`;
        
        columns.forEach(col => {
            html += `<th class="px-6 py-5 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">${col.header}</th>`;
        });

        html += `</tr></thead><tbody class="divide-y divide-gray-50 italic-last-child">`;

        paginatedData.forEach(row => {
            const rowClass = row.deleted_at ? 'bg-red-50/50' : 'hover:bg-gray-50/80';
            html += `<tr class="${rowClass} transition-all duration-150">`;
            
            columns.forEach(col => {
                const val = col.render ? col.render(row) : (row[col.key] || '-');
                html += `<td class="px-6 py-4 text-gray-700 whitespace-nowrap">${val}</td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;

        // 3. Controles de Paginación
        if (totalPages > 1) {
            html += `
                <div class="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                    <div class="flex-1 flex justify-between sm:hidden">
                        <button onclick="AdminBase.goToPage('${containerId}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                        <button onclick="AdminBase.goToPage('${containerId}', ${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p class="text-xs text-gray-500">Página <span class="font-bold text-slate-900">${currentPage}</span> de <span class="font-bold text-slate-900">${totalPages}</span></p>
                        </div>
                        <div>
                            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onclick="AdminBase.goToPage('${containerId}', 1)" ${currentPage === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30">
                                    <span class="sr-only">Primero</span>
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                                </button>
                                <button onclick="AdminBase.goToPage('${containerId}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-slate-800 text-xs font-bold text-white">${currentPage}</span>

                                <button onclick="AdminBase.goToPage('${containerId}', ${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <button onclick="AdminBase.goToPage('${containerId}', ${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30">
                                    <span class="sr-only">Último</span>
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>`;
        }

        // --- PRESERVACIÓN DE FOCO ---
        const activeId = document.activeElement ? document.activeElement.id : null;
        let cursorStart = 0;
        let cursorEnd = 0;
        
        if (activeId === `${containerId}-search-input`) {
            cursorStart = document.activeElement.selectionStart;
            cursorEnd = document.activeElement.selectionEnd;
        }

        container.innerHTML = html;
        
        // --- RESTAURACIÓN DE FOCO ---
        if (activeId) {
            const el = document.getElementById(activeId);
            if (el) {
                el.focus();
                if (activeId === `${containerId}-search-input`) {
                    el.setSelectionRange(cursorStart, cursorEnd);
                }
            }
        }
        
        // Efecto Premium: Scroll suave arriba al cambiar página si no estamos filtrando
        if (currentPage > 1 && Object.keys(filters).length === 0) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Aplica un filtro a una columna específica
     */
    function applyFilter(containerId, colIndex, value) {
        const state = tableRegistry[containerId];
        if (!state) return;

        if (!value.trim()) {
            delete state.filters[colIndex];
        } else {
            state.filters[colIndex] = value;
        }

        // Al filtrar, volvemos a la página 1
        state.currentPage = 1;
        renderTablePage(containerId);
    }

    /**
     * Motor de Búsqueda Global Inteligente con Debounce
     */
    let searchTimeout = null;
    function applyGlobalSearch(containerId, value) {
        const state = tableRegistry[containerId];
        if (!state) return;

        state.globalSearch = value;
        state.currentPage = 1;

        // Debounce de 300ms para no saturar el DOM mientras el usuario escribe
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderTablePage(containerId);
        }, 300);
    }

    /**
     * Limpiador Inteligente de Filtros
     */
    function clearFilters(containerId) {
        const state = tableRegistry[containerId];
        if (!state) return;

        state.filters = {};
        state.globalSearch = '';
        state.currentPage = 1;

        // Limpiar inputs visualmente
        const toolbar = document.querySelector(`#${containerId}`);
        if (toolbar) {
            const globalInput = toolbar.querySelector('input[type="text"]');
            if (globalInput) globalInput.value = '';
            
            const selects = toolbar.querySelectorAll('select');
            selects.forEach(s => s.value = '');
        }

        renderTablePage(containerId);
    }

    /**
     * Función para cambiar de página
     */
    function goToPage(containerId, newPage) {
        const state = tableRegistry[containerId];
        if (!state) return;
        
        const totalPages = Math.ceil(state.data.length / state.perPage);
        if (newPage < 1 || newPage > totalPages) return;

        state.currentPage = newPage;
        renderTablePage(containerId);
    }

    /**
     * Genera botones de acción ejecutivos con etiquetas y SVG
     */
    function generateActionButtons(row, moduleName) {
        if (row.deleted_at) {
            return `
                <button onclick="${moduleName}.restore(${row.id})" 
                        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105 transition-all duration-200 border border-green-200 shadow-sm font-bold text-[10px] uppercase">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Restaurar
                </button>`;
        }
        
        return `
            <div class="flex gap-2">
                <button onclick="${moduleName}.openModal(${row.id})" 
                        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-105 transition-all duration-200 border border-amber-100 shadow-sm group">
                    <svg class="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span class="text-[10px] font-bold uppercase tracking-tight">Editar</span>
                </button>
                <button onclick="${moduleName}.destroy(${row.id})" 
                        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all duration-200 border border-red-100 shadow-sm group">
                    <svg class="w-4 h-4 group-hover:shake transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span class="text-[10px] font-bold uppercase tracking-tight">Eliminar</span>
                </button>
            </div>
        `;
    }

    /**
     * VISUALIZADOR UNIVERSAL DE DOCUMENTOS (IN-APP)
     * Soporta: PDF, Imágenes, Audio, Video y Fichas Técnicas para otros formatos.
     * @param {string} url - Ruta del archivo
     * @param {string} title - Título para el header
     */
    function previewDocument(url, title = 'Visualizador de Soporte') {
        const modal = document.getElementById('modal-preview-doc');
        const content = document.getElementById('preview-doc-content');
        const titleEl = document.getElementById('modal-preview-title');
        const downloadBtn = document.getElementById('btn-download-preview');
        
        if (!modal || !content) return;

        titleEl.textContent = title;
        downloadBtn.href = url;
        
        // Detectar extensión
        const ext = url.split('.').pop().toLowerCase();
        content.innerHTML = '<div class="flex items-center justify-center h-full"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>';

        // Pequeño timeout para suavizar la transición de carga
        setTimeout(() => {
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                content.innerHTML = `<img src="${url}" alt="Soporte" class="max-w-full max-h-full object-contain shadow-2xl rounded-lg border-4 border-white">`;
            } else if (ext === 'pdf') {
                content.innerHTML = `<iframe src="${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH" class="w-full h-full border-0 rounded-sm shadow-inner" style="background: #525659;"></iframe>`;
            } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
                content.innerHTML = `
                    <div class="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <video controls class="w-full h-full">
                            <source src="${url}" type="video/${ext === 'mp4' ? 'mp4' : ext}">
                            Tu navegador no soporta la reproducción de video.
                        </video>
                    </div>`;
            } else if (['mp3', 'wav', 'aac'].includes(ext)) {
                content.innerHTML = `
                    <div class="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-6 max-w-md w-full">
                        <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 animate-pulse">
                            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <div class="text-center">
                            <h4 class="font-black text-slate-800 uppercase tracking-widest text-sm mb-1">Archivo de Audio</h4>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Auditoría de Evidencia Sonora</p>
                        </div>
                        <audio controls class="w-full">
                            <source src="${url}" type="audio/${ext === 'mp3' ? 'mpeg' : ext}">
                        </audio>
                    </div>`;
            } else {
                // Ficha Técnica para formatos no renderizables (Office, CSV, GeoJSON, KML)
                const formatIcons = {
                    xls: 'Excel', xlsx: 'Excel', csv: 'Datos CSV',
                    doc: 'Word', docx: 'Word',
                    ppt: 'PowerPoint', pptx: 'PowerPoint',
                    geojson: 'GeoJSON', kml: 'KML'
                };
                const formatLabel = formatIcons[ext] || `Archivo .${ext.toUpperCase()}`;
                
                content.innerHTML = `
                    <div class="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-6 max-w-sm w-full transition-all hover:scale-[1.02]">
                        <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div class="text-center">
                            <h4 class="font-black text-slate-800 uppercase tracking-widest text-sm mb-1">${formatLabel}</h4>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Este formato requiere descarga para auditoría</p>
                        </div>
                        <a href="${url}" download class="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3"></path></svg>
                            Descargar Ahora
                        </a>
                    </div>`;
            }
        }, 300);

        modal.style.display = 'flex';
    }

    // Inicializar cierre y eventos del visualizador al cargar AdminBase
    document.addEventListener('DOMContentLoaded', () => {
        const btnClose = document.getElementById('btn-close-preview');
        const modal = document.getElementById('modal-preview-doc');

        if (btnClose && modal) {
            btnClose.onclick = () => { 
                modal.style.display = 'none'; 
            };
            // Cerrar al click afuera
            modal.onclick = (e) => { 
                if (e.target === modal) {
                    modal.style.display = 'none'; 
                }
            };
        }
    });

    // EXPORTAR API PÚBLICA
    return {
        getCookie,
        showNotification,
        apiCall,
        renderTable,
        goToPage, 
        applyFilter,
        applyGlobalSearch, // <-- Nueva Búsqueda Global
        clearFilters,      // <-- Nueva Limpieza de filtros
        generateActionButtons,
        previewDocument,   // <-- Visualizador Universal
        formatDate
    };
})();

// Exportar al objeto global window para que otros scripts lo usen
window.AdminBase = AdminBase;