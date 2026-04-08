/**
 * ============================================
 * ADMIN RUTAS MODULE (CORREGIDO POST/PUT)
 * ============================================
 * Gestión de rutas, subida de archivos y validación.
 * Nota: El backend usa POST para actualizaciones debido a manejo de archivos.
 */
const AdminRutas = (function() {
    'use strict';

    let isInitialized = false;
    let rutasList = [];
    let empresasList = [];
    let editingId = null;

    function init() {
        if (isInitialized) return;

        console.log('🚀 Inicializando AdminRutas...');

        document.getElementById('btn-add-ruta')?.addEventListener('click', () => openModal());
        document.getElementById('form-ruta')?.addEventListener('submit', save);
        document.getElementById('btn-cancel-ruta')?.addEventListener('click', closeModal);
        document.getElementById('toggle-deleted-rutas')?.addEventListener('change', load);

        isInitialized = true;
    }

    async function load() {
        const container = document.getElementById('rutas-table');
        if (!container) return;
        
        container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando rutas...</div>';
        const showDeleted = document.getElementById('toggle-deleted-rutas')?.checked || false;

        const params = {
            limit: 100,
            include: 'empresa',
            ...(showDeleted ? { onlySoftDeleted: 'true' } : {})
        };

        const res = await AdminBase.apiCall('/rutas', 'GET', params);
        if (res && res.data) {
            rutasList = res.data.data || res.data;
            render(rutasList);
        } else {
            container.innerHTML = '<div class="p-4 text-center text-red-500">Error cargando rutas.</div>';
        }
    }

    function render(data) {
        const columns = [
            { 
                header: 'ID', 
                key: 'id',
                render: (r) => `<span class="font-mono text-xs text-gray-400">#${r.id}</span>`
            },
            { 
                header: 'Empresa', 
                render: (r) => r.empresa 
                    ? `<span class="text-sm font-medium text-gray-700">${r.empresa.name}</span>` 
                    : '<span class="text-xs text-red-400">Sin empresa</span>'
            },
            { 
                header: 'Nombre Ruta', 
                render: (r) => {
                    const cleanName = r.name.replace('✅', '').replace('[OK]', '').trim();
                    return `<span class="font-bold text-gray-800">${cleanName}</span>`;
                }
            },
            { 
                header: 'Archivo', 
                render: (r) => r.file_name 
                    ? `<a href="/api/rutas/${r.id}/file" target="_blank" 
                          class="inline-flex items-center px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Descargar
                       </a>` 
                    : '<span class="text-gray-400 text-xs italic">Sin archivo</span>' 
            },
            {
                header: 'Gobernanza / Estado',
                filterOptions: [
                    { value: 'Verificada', label: 'Verificadas ✅' },
                    { value: 'Pendiente', label: 'Pendientes ⏳' },
                    { value: 'Papelera', label: 'En Papelera 🗑️' }
                ],
                render: (r) => {
                    if (r.deleted_at) return '<span class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200 shadow-sm">Papelera / Eliminado</span>';
                    
                    const isVerified = r.name.includes('✅') || r.name.includes('[OK]');
                    return isVerified
                        ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200 shadow-sm">
                             <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg> Verificada
                           </span>`
                        : `<span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                             <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Pendiente Revisión
                           </span>`;
                }
            },
            { 
                header: 'Acciones', 
                render: (r) => {
                    let buttons = AdminBase.generateActionButtons(r, 'AdminRutas');
                    const isVerified = r.name.includes('✅') || r.name.includes('[OK]');
                    const safeName = r.name.replace(/'/g, "\\'"); 

                    if (!r.deleted_at) {
                        if (!isVerified) {
                            const btnApprove = `
                                <button onclick="AdminRutas.approve(${r.id}, '${safeName}', ${r.empresa_id})" 
                                        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 transition-all duration-200 border border-indigo-100 shadow-sm group">
                                    <svg class="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span class="text-[10px] font-bold uppercase tracking-tight">Aprobar</span>
                                </button>`;
                            buttons = buttons.replace('<div class="flex gap-2">', '<div class="flex gap-2">' + btnApprove);
                        } else {
                            const btnReject = `
                                <button onclick="AdminRutas.reject(${r.id}, '${safeName}', ${r.empresa_id})" 
                                        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-105 transition-all duration-200 border border-rose-100 shadow-sm group">
                                    <svg class="w-4 h-4 group-hover:-rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span class="text-[10px] font-bold uppercase tracking-tight">Rechazar</span>
                                </button>`;
                            buttons = buttons.replace('<div class="flex gap-2">', '<div class="flex gap-2">' + btnReject);
                        }
                    }
                    return buttons;
                }
            }
        ];
        AdminBase.renderTable(data, columns, 'rutas-table', 10);
    }

    async function approve(id, currentName, empresaId) {
        if(!confirm(`¿Aprobar la ruta "${currentName}"?`)) return;
        const cleanName = currentName.replace('✅', '').replace('[OK]', '').trim();
        const newName = `${cleanName} ✅`;
        const formData = new FormData();
        formData.append('name', newName);
        formData.append('empresa_id', empresaId);
        const res = await AdminBase.apiCall(`/rutas/${id}`, 'POST', formData);
        if (res && res.status) {
            AdminBase.showNotification('success', 'Aprobada', 'La ruta ha sido verificada exitosamente.');
            load();
        }
    }

    async function reject(id, currentName, empresaId) {
        if(!confirm(`¿Desaprobar la ruta y volverla a estado pendiente?`)) return;
        const cleanName = currentName.replace('✅', '').replace('[OK]', '').trim();
        const formData = new FormData();
        formData.append('name', cleanName);
        formData.append('empresa_id', empresaId);
        const res = await AdminBase.apiCall(`/rutas/${id}`, 'POST', formData);
        if (res && res.status) {
            AdminBase.showNotification('info', 'Estado Actualizado', 'La ruta ha vuelto a estado pendiente.');
            load();
        }
    }

    async function loadEmpresas() {
        if (empresasList.length === 0) {
            const res = await AdminBase.apiCall('/empresas', 'GET', { limit: 1000 });
            if (res && res.data) empresasList = res.data.data || res.data;
        }
    }

    async function openModal(id = null) {
        editingId = id;
        const modal = document.getElementById('modal-ruta');
        const form = document.getElementById('form-ruta');
        const selEmpresa = document.getElementById('ruta-empresa');

        if (!modal) return;

        selEmpresa.innerHTML = '<option>Cargando...</option>';
        await loadEmpresas();
        
        selEmpresa.innerHTML = '<option value="">-- Seleccione Empresa --</option>';
        if (empresasList && empresasList.forEach) {
            empresasList.forEach(e => {
                selEmpresa.innerHTML += `<option value="${e.id}">${e.name}</option>`;
            });
        }

        form.reset();
        modal.style.display = 'flex';
        document.getElementById('modal-ruta-title').textContent = id ? 'Editar Ruta' : 'Nueva Ruta';

        if (id) {
            const item = rutasList.find(r => r.id === id);
            if (item) {
                const cleanName = item.name.replace('✅', '').replace('[OK]', '').trim();
                document.getElementById('ruta-name').value = cleanName;
                selEmpresa.value = item.empresa_id;
                document.getElementById('ruta-file-help').textContent = "Dejar vacío para mantener el archivo actual.";
            }
        } else {
            document.getElementById('ruta-file-help').textContent = "Archivo requerido (GeoJSON/KML).";
        }
    }

    function closeModal() {
        document.getElementById('modal-ruta').style.display = 'none';
        editingId = null;
    }

    async function save(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('ruta-name').value);
        formData.append('empresa_id', document.getElementById('ruta-empresa').value);
        const fileInput = document.getElementById('ruta-file');
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }
        let endpoint = '/rutas';
        if (editingId) endpoint += `/${editingId}`;
        const btnSubmit = document.querySelector('#form-ruta button[type="submit"]');
        if (btnSubmit && btnSubmit.disabled) return;
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }
        try {
            const res = await AdminBase.apiCall(endpoint, 'POST', formData);
            if (res && res.status) {
                AdminBase.showNotification('success', 'Éxito', 'Ruta guardada.');
                closeModal();
                load();
            }
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
        }
    }

    async function destroy(id) {
        if (confirm('¿Eliminar ruta?')) {
            await AdminBase.apiCall(`/rutas/${id}`, 'DELETE');
            load();
        }
    }

    async function restore(id) {
        if (confirm('¿Restaurar ruta?')) {
            await AdminBase.apiCall(`/rutas/${id}/rehabilitate`, 'POST');
            load();
        }
    }

    return { init, load, openModal, destroy, restore, approve, reject };
})();

window.AdminRutas = AdminRutas;