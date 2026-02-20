/**
 * ============================================
 * ADMIN CONDUCTORES MODULE
 * ============================================
 */
const AdminConductores = (function() {
    'use strict';

    // --- Variables de Estado ---
    let isInitialized = false; // <--- ESTA ES LA CLAVE PARA QUE FUNCIONE TU SWITCH SIMPLE
    let conductoresList = [];
    let personasList = [];
    let editingId = null;

    /**
     * 1. Inicialización (Idempotente: se puede llamar mil veces y solo corre una)
     */
    function init() {
        if (isInitialized) return; // Si ya se inició, no hace nada.

        console.log('🚀 Inicializando listeners de Conductores...');

        // Listener para abrir modal nuevo
        const btnAdd = document.getElementById('btn-add-conductor');
        if (btnAdd) btnAdd.addEventListener('click', () => openModal());

        // Listener para guardar formulario
        const form = document.getElementById('form-conductor');
        if (form) form.addEventListener('submit', save);

        // Listener para cerrar modal
        const btnCancel = document.getElementById('btn-cancel-conductor');
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        // Listener para el toggle de "Ver Eliminados"
        const toggle = document.getElementById('toggle-deleted-conductores');
        if (toggle) toggle.addEventListener('change', load);

        // Listener para el buscador de personas dentro del modal
        const searchInput = document.getElementById('search-persona-modal');
        if (searchInput) searchInput.addEventListener('keyup', (e) => filterPersonasSelect(e.target.value));

        isInitialized = true; // Marcamos como iniciado
    }

    /**
     * 2. Carga de Datos (GET /api/conductores)
     */
    async function load() {
        const container = document.getElementById('conductores-table');
        if (!container) return;

        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando conductores...</div>';

        // Verificar si queremos ver eliminados
        const showDeleted = document.getElementById('toggle-deleted-conductores')?.checked || false;

        // Parámetros exactos para tu Controlador [cite: 428-439]
        const params = {
            limit: 100,
            include: 'persona', // Relación para ver el nombre
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {}) // Tu controlador usa este param para la papelera
        };

        try {
            const response = await AdminBase.apiCall('/conductores', 'GET', params);

            if (response && response.data) {
                // Tu API devuelve paginación: { status: true, data: { data: [...], total: N } }
                conductoresList = response.data.data || response.data;
                render(conductoresList);
            } else {
                container.innerHTML = '<div class="p-4 text-center text-red-500">No se pudieron cargar los datos.</div>';
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
                render: (r) => `<span class="font-mono text-xs text-gray-500">#${r.id}</span>`
            },
            { 
                header: 'Conductor', 
                render: (r) => r.persona 
                    ? `<div class="flex flex-col">
                        <span class="font-bold text-gray-800">${r.persona.name} ${r.persona.last_name}</span>
                        <span class="text-xs text-gray-500">NUI: ${r.persona.nui}</span>
                       </div>` 
                    : '<span class="text-red-400 italic text-xs">Persona no encontrada (ID: '+r.persona_id+')</span>'
            },
            { 
                header: 'Estado', 
                render: (r) => r.deleted_at 
                    ? `<span class="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">Eliminado</span>` 
                    : `<span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Activo</span>`
            },
            { 
                header: 'Acciones', 
                render: (r) => AdminBase.generateActionButtons(r, 'AdminConductores') 
            }
        ];

        AdminBase.renderTable(data, columns, 'conductores-table');
    }

    /**
     * 4. Lógica del Modal (GET /api/personas para el select)
     */
    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-conductor');
        const form = document.getElementById('form-conductor');
        const title = document.getElementById('modal-conductor-title');
        const searchInput = document.getElementById('search-persona-modal');

        if (!modal) return;

        // Resetear formulario
        form.reset();
        if (searchInput) searchInput.value = '';
        
        modal.style.display = 'flex';
        title.textContent = id ? `Editar Conductor #${id}` : 'Nuevo Conductor';

        // Cargar personas solo si no se han cargado antes (Cache)
        const selectPersona = document.getElementById('conductor-persona');
        
        if (personasList.length === 0) {
            selectPersona.innerHTML = '<option>Cargando directorio...</option>';
            // Traemos un limite alto para que el buscador local funcione bien
            const res = await AdminBase.apiCall('/personas', 'GET', { limit: 500 });
            if (res && res.data) {
                personasList = res.data.data || res.data;
                // Ordenar por nombre
                personasList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
        }

        // Llenar el select con todas las opciones
        populatePersonasSelect(personasList);

        // Si es edición (GET /api/conductores/{id})
        if (id) {
            // Buscamos en la lista cargada primero
            let conductor = conductoresList.find(c => c.id === id);
            
            // Si no está (por paginación), pedimos a la API [cite: 450]
            if (!conductor) {
                const res = await AdminBase.apiCall(`/conductores/${id}`, 'GET', { include: 'persona' });
                if(res && res.data) conductor = res.data;
            }

            if (conductor) {
                selectPersona.value = conductor.persona_id;
            }
        }
    }

    function closeModal() {
        document.getElementById('modal-conductor').style.display = 'none';
        editingId = null;
    }

    // Auxiliar: Llenar Select
    function populatePersonasSelect(list) {
        const select = document.getElementById('conductor-persona');
        select.innerHTML = '<option value="">-- Seleccione Persona --</option>';
        
        // Limitamos visualización a 100 para no congelar el navegador si hay 5000
        // El usuario debe usar el buscador para encontrar los demás
        const displayList = list.slice(0, 100); 
        
        displayList.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nui} - ${p.name} ${p.last_name}`;
            select.appendChild(option);
        });
    }

    // Auxiliar: Filtro local en el modal
    function filterPersonasSelect(term) {
        term = term.toLowerCase();
        const filtered = personasList.filter(p => 
            (p.name && p.name.toLowerCase().includes(term)) || 
            (p.last_name && p.last_name.toLowerCase().includes(term)) || 
            (p.nui && String(p.nui).includes(term))
        );
        populatePersonasSelect(filtered);
    }

    /**
     * 5. Guardar (POST /api/conductores o PUT /api/conductores/{id})
     */
    async function save(e) {
        e.preventDefault();
        
        const personaId = document.getElementById('conductor-persona').value;
        
        // Validación manual simple
        if (!personaId) {
            AdminBase.showNotification('warning', 'Validación', 'Debe seleccionar una persona.');
            return;
        }

        // Payload según [cite: 472]
        const payload = {
            persona_id: parseInt(personaId)
        };

        let response;
        if (editingId) {
            // PUT [cite: 483]
            response = await AdminBase.apiCall(`/conductores/${editingId}`, 'PUT', payload);
        } else {
            // POST [cite: 467]
            response = await AdminBase.apiCall('/conductores', 'POST', payload);
        }

        if (response && response.status) {
            AdminBase.showNotification('success', 'Éxito', 'Operación realizada correctamente.');
            closeModal();
            load(); // Recargar tabla
        }
    }

    /**
     * 6. Eliminar (DELETE /api/conductores/{id})
     */
    async function destroy(id) {
        if (!confirm('¿Confirma que desea eliminar este conductor?')) return;
        
        // DELETE [cite: 499]
        const res = await AdminBase.apiCall(`/conductores/${id}`, 'DELETE');
        
        if (res && res.status) {
            AdminBase.showNotification('success', 'Eliminado', 'Conductor eliminado correctamente.');
            load();
        }
    }

    /**
     * 7. Restaurar (POST /api/conductores/{id}/rehabilitate)
     */
    async function restore(id) {
        if (!confirm('¿Confirma que desea restaurar este conductor?')) return;

        // POST [cite: 507]
        const res = await AdminBase.apiCall(`/conductores/${id}/rehabilitate`, 'POST');
        
        if (res && res.status) {
            AdminBase.showNotification('success', 'Restaurado', 'Conductor activado nuevamente.');
            load();
        }
    }

    // API Pública
    return { init, load, openModal, destroy, restore };
})();

// Exponer a window para que dashboard-admin.js lo vea
window.AdminConductores = AdminConductores;