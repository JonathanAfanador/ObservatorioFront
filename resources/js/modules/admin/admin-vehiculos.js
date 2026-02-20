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

        // PEDIMOS LA RELACIÓN ANIDADA: propietario.persona
        // Esto permite acceder a r.propietario.persona.name
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
                // AQUI MOSTRAMOS EL NOMBRE SI EXISTE
                render: (r) => {
                    if (r.propietario && r.propietario.persona) {
                        return `
                            <div class="flex flex-col">
                                <span class="font-semibold text-sm text-gray-800">${r.propietario.persona.name} ${r.propietario.persona.last_name}</span>
                                <span class="text-xs text-gray-500">NUI: ${r.propietario.persona.nui || '-'}</span>
                            </div>
                        `;
                    }
                    // Fallback al ID si no hay persona asociada
                    return r.propietario_id 
                        ? `<span class="font-mono text-xs text-gray-500">ID Prop.: ${r.propietario_id}</span>` 
                        : '<span class="text-xs text-red-400 italic">Sin asignar</span>';
                }
            },
            { 
                header: 'Servicio', 
                render: (r) => r.servicio 
                    ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Público</span>' 
                    : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Particular</span>'
            },
            { 
                header: 'Estado', 
                render: (r) => r.deleted_at 
                    ? `<span class="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">Eliminado</span>` 
                    : `<span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Activo</span>`
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
        // 1. Tipos de Vehículo
        if (tiposList.length === 0) {
            const res = await AdminBase.apiCall('/tipo-vehiculo', 'GET', { limit: 100 });
            if (res && res.data) tiposList = res.data.data || res.data;
        }
        
        // 2. Propietarios CON Persona
        // Pedimos include=persona para ver el nombre en el select
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

        // Estados de carga visual
        const selectTipo = document.getElementById('vehiculo-tipo');
        const selectProp = document.getElementById('vehiculo-propietario');
        selectTipo.innerHTML = '<option>Cargando...</option>';
        selectProp.innerHTML = '<option>Cargando...</option>';

        await loadAuxData(); 

        // Llenar Select Tipos
        selectTipo.innerHTML = '<option value="">-- Seleccione Tipo --</option>';
        if (tiposList.length > 0) {
            tiposList.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = `${t.descripcion}`;
                selectTipo.appendChild(option);
            });
        }

        // Llenar Select Propietarios (Con nombres)
        selectProp.innerHTML = '<option value="">-- Seleccione Propietario --</option>';
        if (propietariosList.length > 0) {
            propietariosList.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                
                // Lógica para mostrar nombre si existe la relación persona
                let label = `Propietario #${p.id}`;
                if (p.persona) {
                    label += ` - ${p.persona.name} ${p.persona.last_name} (${p.persona.nui})`;
                } else {
                    // Si no hay persona, mostramos la fecha como referencia
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

        // Si es edición
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
            }
        }
    }

    function closeModal() {
        document.getElementById('modal-vehiculo').style.display = 'none';
        editingId = null;
    }

    /**
     * 5. Guardar
     */
    async function save(e) {
        e.preventDefault();
        
        const payload = {
            placa: document.getElementById('vehiculo-placa').value,
            marca: document.getElementById('vehiculo-marca').value,
            modelo: document.getElementById('vehiculo-modelo').value,
            color: document.getElementById('vehiculo-color').value,
            tipo_veh_id: document.getElementById('vehiculo-tipo').value,
            propietario_id: document.getElementById('vehiculo-propietario').value,
            servicio: document.getElementById('vehiculo-servicio').checked
        };

        if (!payload.tipo_veh_id || !payload.propietario_id) {
            AdminBase.showNotification('warning', 'Faltan datos', 'Seleccione Tipo y Propietario.');
            return;
        }

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