// ============================================================
// secretaria-resoluciones.js
// Gestión de Resoluciones: listar, subir y visualizar documentos
// ============================================================

// --- Cargar listado de resoluciones ---
window.loadResoluciones = async function () {
    const container = document.getElementById('lista-resoluciones');
    container.innerHTML = '<div class="loading-state"><p>Cargando...</p></div>';

    const filtroRes = encodeURIComponent(JSON.stringify([{
        "column": "observaciones",
        "operator": "like",
        "value": "%Resolución%"
    }]));

    const res = await apiCall(`/documentos?include=tipo_documento,empresa&filter=${filtroRes}&limit=100`);

    loadEmpresasSelect(); // Llenar select del modal

    if (!res || !res.data || !res.data.data || res.data.data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay resoluciones cargadas.</p></div>';
        return;
    }

    let html = `<table class="modern-table">
        <thead><tr><th>Detalle / Asunto</th><th>Empresa Asignada</th><th>Fecha</th><th class="text-right">Acción</th></tr></thead>
        <tbody>`;

    res.data.data.forEach(doc => {
        const fecha = doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A';
        const nombreEmpresa = doc.empresa
            ? `<span class="badge badge-info">${doc.empresa.name}</span>`
            : '<span class="text-gray-400">General</span>';

        html += `
            <tr>
                <td class="font-medium">${doc.observaciones || 'Sin detalle'}</td>
                <td>${nombreEmpresa}</td>
                <td>${fecha}</td>
                <td class="text-right flex items-center justify-end gap-3">
                    <button onclick="prepareEditResolucion(${doc.id}, '${(doc.observaciones || '').replace(/^Resolución:\s*/, '').replace(/'/g, "\\'")}', '${doc.empresa_id || ''}')" class="text-indigo-600 hover:text-indigo-800 transition-colors" title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="deleteResolucion(${doc.id})" class="text-red-500 hover:text-red-700 transition-colors" title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <button onclick="viewDocumento(${doc.id}, '${(doc.observaciones || 'Resolución').replace(/'/g, "\\'")}')" class="btn-action text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-3" title="Ver PDF">
                        <svg style="width:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Ver Documento
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
};

// --- Llenar select de empresas en el modal de resolución ---
window.loadEmpresasSelect = async function () {
    const select = document.getElementById('res-empresa');
    if (!select || select.options.length > 1) return;

    const res = await apiCall('/empresas?limit=1000');
    select.innerHTML = '<option value="">-- General (Para todas) --</option>';

    if (res && res.data) {
        const list = res.data.data || res.data;
        list.forEach(e => {
            const option = document.createElement('option');
            option.value = e.id;
            option.textContent = e.name;
            select.appendChild(option);
        });
    }
};

// Global para limpiar el URL del blob al cerrar
let currentPdfUrl = null;

// --- Visualizar documento PDF en modal interno ---
window.viewDocumento = async function (id, title) {
    showNotification('info', 'Cargando', 'Preparando vista previa...');
    try {
        const response = await fetch(`/api/documentos/${id}/file`, {
            method: 'GET',
            headers: window.getAuthHeaders ? window.getAuthHeaders() : { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('No se pudo acceder al archivo.');

        const blob = await response.blob();
        if (currentPdfUrl) window.URL.revokeObjectURL(currentPdfUrl);
        
        currentPdfUrl = window.URL.createObjectURL(blob);
        
        const modal = document.getElementById('modal-view-pdf');
        const frame = document.getElementById('pdf-viewer-frame');
        const titleEl = document.getElementById('pdf-viewer-title');

        titleEl.textContent = title;
        frame.src = currentPdfUrl;
        modal.style.display = 'flex';

    } catch (err) {
        showNotification('error', 'Error', 'No se pudo cargar el documento.');
        console.error(err);
    }
};

window.closePdfViewer = function() {
    const modal = document.getElementById('modal-view-pdf');
    const frame = document.getElementById('pdf-viewer-frame');
    
    modal.style.display = 'none';
    frame.src = 'about:blank';

    if (currentPdfUrl) {
        window.URL.revokeObjectURL(currentPdfUrl);
        currentPdfUrl = null;
    }
};

// --- Manejar formulario de subir/editar resolución ---
window.handleSubirResolucion = async function (e) {
    e.preventDefault();
    const idInput = document.getElementById('res-id');
    const fileInput = document.getElementById('res-file');
    const obsInput = document.getElementById('res-obs');
    const empresaInput = document.getElementById('res-empresa');

    const isEdit = idInput && idInput.value;

    if (fileInput.files.length === 0)
        return showNotification('warning', 'Requerido', 'Selecciona un archivo PDF.');
    if (!obsInput.value.trim())
        return showNotification('warning', 'Requerido', 'Escribe el detalle de la resolución.');

    let tipoId = 1; // ID fijo para resoluciones

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('observaciones', `Resolución: ${obsInput.value}`);
    formData.append('tipo_doc_id', tipoId);

    if (empresaInput.value) {
        formData.append('empresa_id', empresaInput.value);
    }

    const endpoint = isEdit ? `/documentos/${idInput.value}` : '/documentos';
    const method = 'POST'; // El backend espera POST para ambos (store y edit con archivo)

    showNotification('info', isEdit ? 'Actualizando' : 'Subiendo', 'Procesando documento oficial...');
    const result = await apiCall(endpoint, method, formData, true);

    if (result && result.status) {
        showNotification('success', 'Éxito', isEdit ? 'Resolución actualizada correctamente.' : 'Resolución publicada correctamente.');
        resetResolucionForm();
        document.getElementById('modal-upload-resolucion').style.display = 'none';
        loadResoluciones();
    }
};

window.resetResolucionForm = function() {
    document.getElementById('form-resolucion').reset();
    document.getElementById('res-id').value = '';
    document.getElementById('modal-res-title').textContent = 'Nueva Resolución Oficial';
    document.getElementById('btn-submit-res').textContent = 'Subir y Publicar';
};

window.prepareEditResolucion = function(id, obs, empresaId) {
    document.getElementById('res-id').value = id;
    document.getElementById('res-obs').value = obs;
    document.getElementById('res-empresa').value = empresaId || '';
    document.getElementById('res-file').value = ''; // Debe re-subir el PDF según reglas del backend
    
    document.getElementById('modal-res-title').textContent = 'Editar Resolución Oficial';
    document.getElementById('btn-submit-res').textContent = 'Actualizar y Publicar';
    document.getElementById('modal-upload-resolucion').style.display = 'flex';
};

window.deleteResolucion = async function(id) {
    if (confirm('¿Está seguro de eliminar esta resolución? Esta acción no se puede deshacer.')) {
        try {
            const res = await apiCall(`/documentos/${id}`, 'DELETE');
            if (res && res.status) {
                showNotification('success', 'Eliminado', 'La resolución ha sido eliminada.');
                loadResoluciones();
            }
        } catch (e) {
            console.error(e);
            showNotification('error', 'Error', 'No se pudo eliminar la resolución.');
        }
    }
};

