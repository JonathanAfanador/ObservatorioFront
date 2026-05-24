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
    let empresasList = [];     // Para el select de Empresas
    let editingId = null;

    /**
     * 1. Inicialización
     */
    function init() {
        console.log('Inicializando AdminPropietarios...');

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

        // Pedimos relaciones y ordenamos por updated_at de forma descendente (último modificado primero)
        const params = {
            limit: 100,
            include: 'persona,documento,empresa',
            orderBy: 'updated_at',
            orderDir: 'desc',
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const response = await AdminBase.apiCall('/propietarios', 'GET', params);

        if (response && response.data) {
            propietariosList = response.data.data || response.data;
            render(propietariosList);
            setupPropietariosSearch();
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
                render: (r) => `<span class="font-mono text-xs text-gray-400">#${r.id}</span>`
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
                header: 'Empresa',
                render: (r) => r.empresa 
                    ? `<span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 uppercase">${r.empresa.name}</span>`
                    : '<span class="text-gray-400 italic text-[10px]">Sin asignar</span>'
            },
            { 
                header: 'Tarjeta Propiedad', 
                render: (r) => r.documento 
                    ? `<button onclick="AdminBase.previewDocument(${r.documento.id}, 'Tarjeta de Propiedad - ${r.persona ? r.persona.name : 'S/N'}')" 
                               class="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-black text-[11px] uppercase tracking-wider group transition-all">
                        <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Ver Soporte
                       </button>`
                    : '<span class="text-red-400 text-[10px] italic">Sin tarjeta</span>'
            },
            { 
                header: 'Fecha Reg.', 
                render: (r) => `<span class="text-xs text-gray-500">${AdminBase.formatDate(r.fecha_registro)}</span>`
            },
            { 
                header: 'Estado', 
                render: (r) => r.deleted_at 
                    ? `<span class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200 shadow-sm">Papelera</span>` 
                    : `<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200 shadow-sm">Activo</span>`
            },
            { 
                header: 'Acciones', 
                render: (r) => AdminBase.generateActionButtons(r, 'AdminPropietarios') 
            }
        ];
        // Activamos paginación automática con Toolbar minimalista y búsqueda global oculta
        AdminBase.renderTable(data, columns, 'propietarios-table', 10, { hideGlobalSearch: true });
    }

    /**
     * 3.1 Buscador Local
     */
    function setupPropietariosSearch() {
        const input = document.getElementById('search-propietarios');
        if (!input) return;

        // Clonar para limpiar eventos
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        newInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = propietariosList.filter(item => {
                const persona = item.persona || {};
                const fullName = `${persona.name} ${persona.last_name}`.toLowerCase();
                const nui = String(persona.nui || '').toLowerCase();
                return fullName.includes(term) || nui.includes(term);
            });
            render(filtered);
        });
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
        
        // Cargar Empresas (para asignación)
        if (empresasList.length === 0) {
            const res = await AdminBase.apiCall('/empresas', 'GET', { limit: 100 });
            if (res && res.data) empresasList = res.data.data || res.data;
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
        if (selPersona) selPersona.innerHTML = '<option>Cargando...</option>';

        await loadAuxData();

        // Llenar Select Personas
        populatePersonas(personasList);

        // Llenar Select Empresas
        const selEmp = document.getElementById('propietario-empresa');
        selEmp.innerHTML = '<option value="">-- Seleccione Empresa --</option>';
        empresasList.forEach(e => {
            selEmp.innerHTML += `<option value="${e.id}">${e.name}</option>`;
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
                document.getElementById('propietario-empresa').value = item.empresa_id || '';
                // Formatear fecha para input datetime-local
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
        
        const persona_id = document.getElementById('propietario-persona').value;
        const empresa_id = document.getElementById('propietario-empresa').value;
        const fecha_registro = document.getElementById('propietario-fecha').value;
        const fileInput = document.getElementById('propietario-archivo');

        if (!persona_id || !empresa_id) {
            AdminBase.showNotification('warning', 'Datos incompletos', 'Seleccione persona y empresa.');
            return;
        }

        // Usamos FormData para enviar el archivo
        const formData = new FormData();
        formData.append('persona_id', persona_id);
        formData.append('empresa_id', empresa_id);
        formData.append('fecha_registro', fecha_registro);

        if (fileInput.files[0]) {
            formData.append('archivo_tarjeta', fileInput.files[0]);
        } else if (!editingId) {
            AdminBase.showNotification('warning', 'Archivo requerido', 'Debe subir la tarjeta de propiedad.');
            return;
        }

        const btnSubmit = document.querySelector('#form-propietario button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

        try {
            let res;
            if (editingId) {
                // Laravel requiere _method=PUT para procesar FormData como PUT.
                // Como ya reparamos admin-base.js, PHP ahora sí leerá correctamente el _method.
                formData.append('_method', 'PUT');
                res = await AdminBase.apiCall(`/propietarios/${editingId}`, 'POST', formData);
            } else {
                res = await AdminBase.apiCall('/propietarios', 'POST', formData);
            }
            if (res && res.status) {
                AdminBase.showNotification('success', 'Éxito', 'Propietario guardado correctamente.');
                closeModal();
                load();
            }
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
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