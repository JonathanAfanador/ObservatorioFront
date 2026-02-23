/**
 * ============================================
 * ADMIN PROPIETARIOS MODULE
 * ============================================
 * Gestión de propietarios vinculando Personas y Documentos.
 */
const AdminPropietarios = (function() {
    'use strict';

    // Estado local
    let propietariosList = [];
    let personasList = [];     // Para el select de Personas
    let documentosList = [];   // Para el select de Documentos
    let editingId = null;

    /**
     * 1. Inicialización
     */
    function init() {
        console.log(' Inicializando AdminPropietarios...');

        // Listeners de botones (Asegúrate que los IDs existan en tu HTML)
        const btnAdd = document.getElementById('btn-add-propietario');
        if (btnAdd) btnAdd.onclick = () => openModal();

        const form = document.getElementById('form-propietario');
        if (form) form.onsubmit = save;

        const btnCancel = document.getElementById('btn-cancel-propietario');
        if (btnCancel) btnCancel.onclick = closeModal;

        const toggle = document.getElementById('toggle-deleted-propietarios');
        if (toggle) toggle.onchange = load;
        
        // Buscador de personas dentro del modal
        const searchPersona = document.getElementById('search-persona-propietario');
        if (searchPersona) searchPersona.onkeyup = (e) => filterPersonasSelect(e.target.value);
    }

    /**
     * 2. Carga de Datos (GET /api/propietarios)
     */
    async function load() {
        const container = document.getElementById('propietarios-table');
        if (!container) return;

        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando propietarios...</div>';
        const showDeleted = document.getElementById('toggle-deleted-propietarios')?.checked || false;

        // Pedimos relaciones: persona (para el nombre) y documento (para referencia)
        const params = {
            limit: 100,
            include: 'persona,documento',
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const response = await AdminBase.apiCall('/propietarios', 'GET', params);

        if (response && response.data) {
            propietariosList = response.data.data || response.data;
            render(propietariosList);
        } else {
            container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos.</div>';
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
                header: 'Propietario', 
                render: (r) => r.persona 
                    ? `<div class="flex flex-col">
                        <span class="font-bold text-gray-800">${r.persona.name} ${r.persona.last_name}</span>
                        <span class="text-xs text-gray-500">NUI: ${r.persona.nui}</span>
                       </div>`
                    : '<span class="text-red-400 italic text-xs">Sin persona asociada</span>'
            },
            { 
                header: 'Documento Soporte', 
                render: (r) => r.documento 
                    ? `<span class="text-sm text-blue-600 truncate max-w-xs block" title="${r.documento.observaciones || 'Sin obs'}">
                        Doc #${r.documento.id}
                       </span>`
                    : '-'
            },
            { 
                header: 'Fecha Registro', 
                render: (r) => AdminBase.formatDate(r.fecha_registro)
            },
            { 
                header: 'Estado', 
                render: (r) => r.deleted_at 
                    ? `<span class="badge bg-red-100 text-red-800">Eliminado</span>` 
                    : `<span class="badge bg-green-100 text-green-800">Activo</span>`
            },
            { 
                header: 'Acciones', 
                render: (r) => AdminBase.generateActionButtons(r, 'AdminPropietarios') 
            }
        ];

        AdminBase.renderTable(data, columns, 'propietarios-table');
    }

    /**
     * Carga datos auxiliares para los selects
     */
    async function loadAuxData() {
        // Cargar Personas (para seleccionar quién es el dueño)
        if (personasList.length === 0) {
            const res = await AdminBase.apiCall('/personas', 'GET', { limit: 500 });
            if (res && res.data) personasList = res.data.data || res.data;
        }
        
        // Cargar Documentos (requisito del modelo)
        if (documentosList.length === 0) {
            const res = await AdminBase.apiCall('/documentos', 'GET', { limit: 100 });
            if (res && res.data) documentosList = res.data.data || res.data;
        }
    }

    /**
     * 4. Modal (Crear/Editar)
     */
    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-propietario');
        const form = document.getElementById('form-propietario');
        const title = document.getElementById('modal-propietario-title');
        
        if (!modal) return;

        // Estado de carga visual
        const selPersona = document.getElementById('propietario-persona');
        const selDoc = document.getElementById('propietario-documento');
        selPersona.innerHTML = '<option>Cargando...</option>';
        selDoc.innerHTML = '<option>Cargando...</option>';

        await loadAuxData();

        // Llenar Select Personas (usamos función helper para filtrar luego)
        populatePersonas(personasList);

        // Llenar Select Documentos
        selDoc.innerHTML = '<option value="">-- Seleccione Documento --</option>';
        documentosList.forEach(d => {
            // Mostramos ID y un trozo de la observación
            const obs = d.observaciones ? d.observaciones.substring(0, 30) + '...' : 'Sin obs';
            selDoc.innerHTML += `<option value="${d.id}">Doc #${d.id} - ${obs}</option>`;
        });

        // Resetear y mostrar
        form.reset();
        // Poner fecha actual por defecto si es nuevo
        if (!id) {
            const now = new Date().toISOString().slice(0, 16); // Formato datetime-local
            document.getElementById('propietario-fecha').value = now;
        }
        
        modal.style.display = 'flex';
        title.textContent = id ? 'Editar Propietario' : 'Nuevo Propietario';

        // Si es edición
        if (id) {
            let item = propietariosList.find(p => p.id === id);
            if (!item) {
                const res = await AdminBase.apiCall(`/propietarios/${id}`);
                item = res.data;
            }

            if (item) {
                selPersona.value = item.persona_id;
                selDoc.value = item.documento_id;
                // Formatear fecha para input datetime-local (YYYY-MM-DDTHH:mm)
                if (item.fecha_registro) {
                    document.getElementById('propietario-fecha').value = item.fecha_registro.substring(0, 16);
                }
            }
        }
    }

    function populatePersonas(list) {
        const sel = document.getElementById('propietario-persona');
        sel.innerHTML = '<option value="">-- Seleccione Persona --</option>';
        const limit = 100; // Límite visual
        let count = 0;
        
        for(const p of list) {
            if (count >= limit) break;
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nui} - ${p.name} ${p.last_name}`;
            sel.appendChild(opt);
            count++;
        }
    }

    function filterPersonasSelect(term) {
        const lower = term.toLowerCase();
        const filtered = personasList.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            p.last_name.toLowerCase().includes(lower) ||
            String(p.nui).includes(lower)
        );
        populatePersonas(filtered);
    }

    function closeModal() {
        document.getElementById('modal-propietario').style.display = 'none';
        editingId = null;
    }

    /**
     * 5. Guardar
     */
    async function save(e) {
        e.preventDefault();
        
        const payload = {
            persona_id: document.getElementById('propietario-persona').value,
            documento_id: document.getElementById('propietario-documento').value,
            fecha_registro: document.getElementById('propietario-fecha').value
        };

        if (!payload.persona_id || !payload.documento_id) {
            AdminBase.showNotification('warning', 'Datos incompletos', 'Seleccione persona y documento.');
            return;
        }

        let res;
        if (editingId) {
            res = await AdminBase.apiCall(`/propietarios/${editingId}`, 'PUT', payload);
        } else {
            res = await AdminBase.apiCall('/propietarios', 'POST', payload);
        }

        if (res && res.status) {
            AdminBase.showNotification('success', 'Éxito', 'Propietario guardado.');
            closeModal();
            load();
        }
    }

    /**
     * 6. Eliminar / Restaurar
     */
    async function destroy(id) {
        if (confirm('¿Eliminar propietario?')) {
            const res = await AdminBase.apiCall(`/propietarios/${id}`, 'DELETE');
            if (res?.status) {
                AdminBase.showNotification('success', 'Eliminado', 'Registro eliminado.');
                load();
            }
        }
    }

    async function restore(id) {
        if (confirm('¿Restaurar propietario?')) {
            const res = await AdminBase.apiCall(`/propietarios/${id}/rehabilitate`, 'POST');
            if (res?.status) {
                AdminBase.showNotification('success', 'Restaurado', 'Registro restaurado.');
                load();
            }
        }
    }

    return { init, load, openModal, destroy, restore };
})();

window.AdminPropietarios = AdminPropietarios;