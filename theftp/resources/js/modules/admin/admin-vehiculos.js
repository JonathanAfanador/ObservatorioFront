/**
 * ============================================
 * ADMIN VEHICULOS MODULE (CON NOMBRES DE PROPIETARIOS)
 * ============================================
 */
const AdminVehiculos = (function() {
    'use strict';

    let isInitialized = false;
    let vehiculosList = [];
    let tiposList = [];
    let propietariosList = [];
    let editingId = null;

    /**
     * 1. Inicialización
     */
    function init() {
        if (isInitialized) return;

        console.log('🚀 Inicializando AdminVehiculos...');

        const btnAdd = document.getElementById('btn-add-vehiculo');
        if (btnAdd) btnAdd.addEventListener('click', () => openModal());

        const form = document.getElementById('form-vehiculo');
        if (form) form.addEventListener('submit', save);

        const btnCancel = document.getElementById('btn-cancel-vehiculo');
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        const toggle = document.getElementById('toggle-deleted-vehiculos');
        if (toggle) toggle.addEventListener('change', load);

        isInitialized = true;
    }

    /**
     * 2. Carga de Datos (Tabla)
     */
    async function load() {
        const container = document.getElementById('vehiculos-table');
        if (!container) return;

        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando vehículos...</div>';
        
        const showDeleted = document.getElementById('toggle-deleted-vehiculos')?.checked || false;

        const params = {
            limit: 100,
            include: 'tipo,propietario.persona', 
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        try {
            const response = await AdminBase.apiCall('/vehiculos', 'GET', params);

            if (response && response.data) {
                vehiculosList = response.data.data || response.data;
                render(vehiculosList);
            } else {
                container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos.</div>';
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="p-4 text-center text-red-500">Error: ${error.message}</div>`;
        }
    }

    /**
     * 3. Renderizado de Tabla
     */
    function render(data) {
        const columns = [
            { 
                header: 'ID', 
                key: 'id',
                render: (r) => `<span class="font-mono text-xs text-gray-400">#${r.id}</span>`
            },
            { 
                header: 'Placa', 
                render: (r) => `<span class="font-bold text-gray-900 uppercase bg-gray-100 px-2 py-1 rounded border border-gray-300">${r.placa}</span>`
            },
            { 
                header: 'Vehículo', 
                render: (r) => `
                    <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-700">${r.marca} ${r.modelo}</span>
                        <span class="text-xs text-gray-500 flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-gray-400"></span> ${r.color}
                        </span>
                    </div>`
            },
            { 
                header: 'Tipo', 
                render: (r) => r.tipo 
                    ? `<span class="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-100">${r.tipo.descripcion}</span>` 
                    : '-'
            },
            { 
                header: 'Propietario', 
                render: (r) => {
                    if (r.propietario && r.propietario.persona) {
                        return `
                            <div class="flex flex-col">
                                <span class="font-semibold text-sm text-gray-800">${r.propietario.persona.name} ${r.propietario.persona.last_name}</span>
                                <span class="text-xs text-gray-500">NUI: ${r.propietario.persona.nui || '-'}</span>
                            </div>
                        `;
                    }
                    return r.propietario_id 
                        ? `<span class="font-mono text-xs text-gray-500">ID Prop.: ${r.propietario_id}</span>` 
                        : '<span class="text-xs text-red-400 italic">Sin asignar</span>';
                }
            },
            { 
                header: 'Servicio', 
                filterOptions: ['Público', 'Particular'],
                render: (r) => r.servicio 
                    ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Público</span>' 
                    : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Particular</span>'
            },
            { 
                header: 'Estado', 
                filterOptions: ['Habilitado', 'Inactivo', 'Papelera'],
                render: (r) => {
                    const registroBadge = r.deleted_at 
                        ? `<span class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200 shadow-sm">Papelera</span>` 
                        : `<span class="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase border border-blue-200 shadow-sm">Presente</span>`;
                    
                    const isHabilitado = r.estado !== false && r.estado !== 0 && String(r.estado) !== '0';
                    const habilitacionBadge = isHabilitado
                        ? `<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200 shadow-sm">Habilitado</span>`
                        : `<span class="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase border border-orange-200 shadow-sm">Inactivo</span>`;
                        
                    return `<div class="flex flex-col items-start gap-1.5">${habilitacionBadge} ${registroBadge}</div>`;
                }
            },
            { 
                header: 'Acciones', 
                render: (r) => AdminBase.generateActionButtons(r, 'AdminVehiculos') 
            }
        ];

        AdminBase.renderTable(data, columns, 'vehiculos-table');
    }

    /**
     * Carga datos auxiliares para los Selects del Modal
     */
    async function loadAuxData() {
        if (tiposList.length === 0) {
            const res = await AdminBase.apiCall('/tipo-vehiculo', 'GET', { limit: 100 });
            if (res && res.data) tiposList = res.data.data || res.data;
        }
        if (propietariosList.length === 0) {
            const res = await AdminBase.apiCall('/propietarios', 'GET', { limit: 1000, include: 'persona' });
            if (res && res.data) propietariosList = res.data.data || res.data;
        }
    }

    /**
     * 4. Abrir Modal
     */
    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-vehiculo');
        const form = document.getElementById('form-vehiculo');
        const title = document.getElementById('modal-vehiculo-title');

        if (!modal) return;

        const selectTipo = document.getElementById('vehiculo-tipo');
        const selectProp = document.getElementById('vehiculo-propietario');
        selectTipo.innerHTML = '<option>Cargando...</option>';
        selectProp.innerHTML = '<option>Cargando...</option>';

        await loadAuxData(); 

        selectTipo.innerHTML = '<option value="">-- Seleccione Tipo --</option>';
        if (tiposList.length > 0) {
            tiposList.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = `${t.descripcion}`;
                selectTipo.appendChild(option);
            });
        }

        selectProp.innerHTML = '<option value="">-- Seleccione Propietario --</option>';
        if (propietariosList.length > 0) {
            propietariosList.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                let label = `Propietario #${p.id}`;
                if (p.persona) {
                    label += ` - ${p.persona.name} ${p.persona.last_name} (${p.persona.nui})`;
                } else {
                    const fecha = (typeof AdminBase.formatDate === 'function' && p.fecha_registro) 
                        ? AdminBase.formatDate(p.fecha_registro) 
                        : '-';
                    label += ` (Reg: ${fecha})`;
                }
                option.textContent = label;
                selectProp.appendChild(option);
            });
        }

        form.reset();
        modal.style.display = 'flex';
        title.textContent = id ? `Editar Vehículo #${id}` : 'Nuevo Vehículo';

        if (id) {
            let item = vehiculosList.find(v => v.id === id);
            if (!item) {
                const res = await AdminBase.apiCall(`/vehiculos/${id}`);
                item = res ? res.data : null;
            }

            if (item) {
                document.getElementById('vehiculo-placa').value = item.placa || '';
                document.getElementById('vehiculo-marca').value = item.marca || '';
                document.getElementById('vehiculo-modelo').value = item.modelo || '';
                document.getElementById('vehiculo-color').value = item.color || '';
                document.getElementById('vehiculo-tipo').value = item.tipo_veh_id || '';
                document.getElementById('vehiculo-propietario').value = item.propietario_id || '';
                document.getElementById('vehiculo-servicio').checked = (item.servicio == 1 || item.servicio === true);
                document.getElementById('vehiculo-estado').value = (item.estado == false || item.estado == 0) ? '0' : '1';
                document.getElementById('vehiculo-motivo').value = item.motivo_estado || '';
            }
        }
    }

    function closeModal() {
        document.getElementById('modal-vehiculo').style.display = 'none';
        editingId = null;
    }

    async function save(e) {
        e.preventDefault();
        const payload = {
            placa: document.getElementById('vehiculo-placa').value,
            marca: document.getElementById('vehiculo-marca').value,
            modelo: document.getElementById('vehiculo-modelo').value,
            color: document.getElementById('vehiculo-color').value,
            tipo_veh_id: document.getElementById('vehiculo-tipo').value,
            propietario_id: document.getElementById('vehiculo-propietario').value,
            servicio: document.getElementById('vehiculo-servicio').checked,
            estado: parseInt(document.getElementById('vehiculo-estado').value),
            motivo_estado: document.getElementById('vehiculo-motivo').value.trim()
        };

        if (!payload.tipo_veh_id || !payload.propietario_id) {
            AdminBase.showNotification('warning', 'Faltan datos', 'Seleccione Tipo y Propietario.');
            return;
        }

        const btnSubmit = document.querySelector('#form-vehiculo button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

        try {
            let response;
            if (editingId) {
                response = await AdminBase.apiCall(`/vehiculos/${editingId}`, 'PUT', payload);
            } else {
                response = await AdminBase.apiCall('/vehiculos', 'POST', payload);
            }
            if (response && response.status) {
                AdminBase.showNotification('success', 'Éxito', 'Vehículo guardado correctamente.');
                closeModal();
                load();
            }
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
        }
    }

    async function destroy(id) {
        if (!confirm('¿Confirma que desea eliminar este vehículo?')) return;
        const res = await AdminBase.apiCall(`/vehiculos/${id}`, 'DELETE');
        if (res && res.status) {
            AdminBase.showNotification('success', 'Eliminado', 'Vehículo eliminado.');
            load();
        }
    }

    async function restore(id) {
        if (!confirm('¿Restaurar este vehículo?')) return;
        const res = await AdminBase.apiCall(`/vehiculos/${id}/rehabilitate`, 'POST');
        if (res && res.status) {
            AdminBase.showNotification('success', 'Restaurado', 'Vehículo restaurado.');
            load();
        }
    }

    return { init, load, openModal, destroy, restore };
})();

window.AdminVehiculos = AdminVehiculos;