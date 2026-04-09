/**
 * ============================================
 * ADMIN AUDITORIA MODULE
 * ============================================
 * Gestión y visualización del rastreo de actividades
 */

const AdminAuditoria = {
    init() {
        console.log('AdminAuditoria: Inicializando...');
        this.setupDateInputs();
    },

    setupDateInputs() {
        const today = new Date().toISOString().split('T')[0];
        const startInput = document.getElementById('audit-date-start');
        const endInput = document.getElementById('audit-date-end');

        if (startInput) {
            startInput.max = today;
        }
        if (endInput) {
            endInput.max = today;
            // Solo establecemos el valor si está vacío para no sobreescribir filtros activos al recargar
            if (!endInput.value) {
                endInput.value = today;
            }
        }
    },

    async load() {
        const tableContainer = document.getElementById('auditoria-table');
        if (!tableContainer) return;

        tableContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-slate-300">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600 mb-4"></div>
                <span class="text-xs font-black uppercase tracking-widest">Sincronizando Expedientes...</span>
            </div>
        `;

        this.setupDateInputs();

        try {
            // Aumentamos el límite a 500 registros para aprovechar la paginación local
            const response = await AdminBase.apiCall('/auditoria?include=user&orderBy=created_at&orderDirection=desc&limit=500');
            
            if (response && response.status) {
                this.currentAudits = response.data.data;
                this.filterByDate();
            } else if (response) {
                tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold">Error: ${response.message}</div>`;
            } else {
                tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold">Error interno cargando auditoría.</div>`;
            }
        } catch (error) {
            console.error('Error cargando auditoría:', error);
            tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold">Error de conexión con el servidor de rastreo.</div>`;
        }
    },

    filterByDate() {
        const startInput = document.getElementById('audit-date-start');
        const endInput = document.getElementById('audit-date-end');
        
        let filteredData = this.currentAudits || [];

        if (startInput && endInput && (startInput.value || endInput.value)) {
            const startDate = startInput.value ? new Date(startInput.value + 'T00:00:00') : new Date('2000-01-01');
            const endDate = endInput.value ? new Date(endInput.value + 'T23:59:59') : new Date('2100-01-01');

            filteredData = filteredData.filter(audit => {
                const auditDate = new Date(audit.created_at);
                return auditDate >= startDate && auditDate <= endDate;
            });
        }

        this.renderAdvancedTable(filteredData);
    },

    clearDateFilter() {
        const startInput = document.getElementById('audit-date-start');
        const endInput = document.getElementById('audit-date-end');
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';
        this.filterByDate();
    },

    renderAdvancedTable(dataToRender = this.currentAudits) {
        // Extraer los nombres de módulos únicos para crear un filtro dinámico automático
        const uniqueModules = [...new Set(dataToRender.map(a => this.formatModelName(a.auditable_type)))].filter(Boolean);

        const columns = [
            {
                header: 'Usuario / IP',
                key: 'user', // Clave para fallbacks
                render: (row) => {
                    const userName = row.user ? row.user.name : 'Sistema / Desconocido';
                    return `
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                ${userName.charAt(0)}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-slate-700">${userName}</span>
                                <span class="text-[10px] text-slate-400 font-medium">${row.ip_address || '0.0.0.0'}</span>
                            </div>
                        </div>
                    `;
                }
            },
            {
                header: 'Acción',
                filterOptions: [
                    { value: 'created', label: 'Creación (Created)' },
                    { value: 'updated', label: 'Actualización (Updated)' },
                    { value: 'deleted', label: 'Eliminación (Deleted)' },
                    { value: 'restored', label: 'Restauración (Restored)' }
                ],
                render: (row) => {
                    const eventColor = this.getEventColor(row.event);
                    return `<span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${eventColor}">${row.event}</span>`;
                }
            },
            {
                header: 'Módulo',
                filterOptions: uniqueModules.map(m => ({ value: m, label: m })),
                render: (row) => {
                    const modelName = this.formatModelName(row.auditable_type);
                    return `<span class="text-xs font-bold text-slate-600">${modelName}</span>`;
                }
            },
            {
                header: 'Cambios',
                render: (row) => {
                    return `
                        <button onclick="AdminAuditoria.showChanges('${row.id}')" class="flex items-center gap-1.5 text-[10px] bg-rose-50 px-3 py-2 rounded-lg font-black text-rose-600 hover:bg-rose-100 hover:scale-105 transition-all shadow-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            VER DETALLE
                        </button>
                    `;
                }
            },
            {
                header: 'Fecha',
                render: (row) => {
                    const dateStr = AdminBase.formatDate(row.created_at, true);
                    return `<span class="text-xs font-bold text-slate-500 italic">${dateStr}</span>`;
                }
            }
        ];

        // Usar AdminBase para renderizar con paginación de 10 por página
        AdminBase.renderTable(dataToRender, columns, 'auditoria-table', 10);
    },

    getEventColor(event) {
        switch (event) {
            case 'created': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'updated': return 'bg-amber-50 text-amber-600 border border-amber-100';
            case 'deleted': return 'bg-rose-50 text-rose-600 border border-rose-100';
            case 'restored': return 'bg-blue-50 text-blue-600 border border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border border-slate-100';
        }
    },

    formatModelName(type) {
        if (!type) return 'N/A';
        const parts = type.split('\\');
        return parts[parts.length - 1];
    },

    showChanges(id) {
        const audit = this.currentAudits.find(a => a.id == id);
        if (!audit) return;

        const modal = document.getElementById('modal-audit-detail');
        if (!modal) {
            console.error('Modal de detalle no encontrado en el DOM');
            return;
        }

        // 1. Parsing Seguro de JSONs
        let oldVals = {};
        let newVals = {};
        try {
            oldVals = (audit.old_values && typeof audit.old_values === 'string') 
                        ? (audit.old_values === '[]' ? {} : JSON.parse(audit.old_values)) 
                        : (audit.old_values || {});
                        
            newVals = (audit.new_values && typeof audit.new_values === 'string') 
                        ? (audit.new_values === '[]' ? {} : JSON.parse(audit.new_values)) 
                        : (audit.new_values || {});
        } catch (e) {
            console.warn("No se pudo parsear los valores JSON de auditoría:", e);
        }

        // 2. Metadatos de Cabecera
        const userName = audit.user ? audit.user.name : 'Sistema';
        const modelName = this.formatModelName(audit.auditable_type);
        const dateStr = AdminBase.formatDate(audit.created_at, true);
        const ip = audit.ip_address || '0.0.0.0';

        document.getElementById('modal-audit-subtitle').textContent = `Inspección de ${modelName} - ID #${audit.auditable_id}`;
        
        document.getElementById('audit-metadata').innerHTML = `
            <div class="flex flex-col">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Autor de Mutación</span>
                <span class="text-sm font-bold text-slate-800">${userName}</span>
            </div>
            <div class="flex flex-col border-l border-slate-100 pl-4">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vector de Origen</span>
                <span class="text-sm font-bold text-slate-800">${ip}</span>
            </div>
            <div class="flex flex-col border-l border-slate-100 pl-4">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estampa de Tiempo</span>
                <span class="text-xs font-bold text-slate-800 my-auto">${dateStr}</span>
            </div>
            <div class="flex flex-col border-l border-slate-100 pl-4">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entidad Auditada</span>
                <span class="text-sm font-bold text-slate-800">${modelName} (#${audit.auditable_id})</span>
            </div>
        `;

        // 3. Etiqueta de Evento
        const badge = document.getElementById('audit-event-badge');
        badge.textContent = audit.event;
        badge.className = `px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${this.getEventColor(audit.event)}`;

        // 4. Calculando Diferencias (Ignorar campos técnicos)
        const ignoredKeys = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
        const allKeys = [...new Set([...Object.keys(oldVals), ...Object.keys(newVals)])].filter(k => !ignoredKeys.includes(k));

        const tbody = document.getElementById('audit-diff-body');
        const emptyState = document.getElementById('audit-no-changes');
        
        tbody.innerHTML = '';
        
        if (allKeys.length === 0) {
            tbody.parentElement.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            tbody.parentElement.classList.remove('hidden');
            emptyState.classList.add('hidden');

            allKeys.forEach(key => {
                const oldVal = (oldVals[key] !== undefined && oldVals[key] !== null) ? String(oldVals[key]) : '<span class="text-rose-300 italic opacity-50">Vacio/Nulo</span>';
                const newVal = (newVals[key] !== undefined && newVals[key] !== null) ? String(newVals[key]) : '<span class="text-emerald-300 italic opacity-50">Vacio/Nulo</span>';
                
                // Resaltar celdas solo si hubo un cambio real
                const isChanged = oldVals[key] != newVals[key];
                const bgOld = isChanged ? 'bg-rose-50/50' : '';
                const bgNew = isChanged ? 'bg-emerald-50/50' : '';

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-4 border-r border-slate-100">
                            <span class="text-xs font-black text-slate-600 tracking-tight">${key}</span>
                        </td>
                        <td class="px-6 py-4 border-r border-slate-100 ${bgOld}">
                            <span class="text-xs font-medium text-slate-700">${oldVal}</span>
                        </td>
                        <td class="px-6 py-4 ${bgNew}">
                            <span class="text-xs font-medium text-slate-900">${newVal}</span>
                        </td>
                    </tr>
                `;
            });
        }

        // 5. Mostrar Modal
        modal.style.display = 'flex';
        // Animación suave de entrada
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95) translateY(10px)';
        
        // Trigger Reflow
        void modal.offsetWidth;

        modalContent.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1) translateY(0)';

        // Click outside to close (Evitar múltiples listeners si se llama varias veces)
        modal.onclick = (e) => { 
            if (e.target === modal) {
                modal.style.display = 'none'; 
            }
        };
    }
};

window.AdminAuditoria = AdminAuditoria;
