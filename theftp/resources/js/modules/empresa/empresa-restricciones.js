// ==========================
// Gestión de Restricciones
// ==========================

async function loadRestricciones() {
    const tableContainer = document.getElementById('restricciones-table');
    if (!tableContainer) return;

    tableContainer.innerHTML = '<div class="loading-state"><p>Cargando restricciones...</p></div>';

    try {
        const response = await apiGet('/restricciones-licencia');
        const list = normalizeList(response);

        if (list.length === 0) {
            tableContainer.innerHTML = '<div class="empty-state"><p>No hay restricciones registradas.</p></div>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        list.forEach(r => {
            const isActivo = r.estado === true || r.estado === 1 || String(r.estado) === '1';
            const statusLabel = isActivo 
                ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Habilitada</span>' 
                : '<span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Inhabilitada</span>';

            html += `
                <tr>
                    <td>${r.descripcion}</td>
                    <td>${statusLabel}</td>
                    <td class="px-4 py-2 text-center" style="width: 100px;">
                        <button class="btn-edit btn-sm" 
                                onclick="editRestriccion(${r.id}, '${r.descripcion}', ${isActivo})" 
                                title="Editar Restricción">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:14px; height:14px;">
                                <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 6.5l4 4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        tableContainer.innerHTML = html;

    } catch (error) {
        console.error('Error cargando restricciones:', error);
        tableContainer.innerHTML = '<div class="error-state"><p>Error al cargar los datos.</p></div>';
    }
}

function openModalRestriccion() {
    window.restriccionEditingId = null;
    document.getElementById('restriccion-id').value = '';
    document.getElementById('form-restriccion').reset();
    document.getElementById('restriccion-modal-title').textContent = 'Nueva Restricción';
    document.getElementById('modal-restriccion').style.display = 'flex';
}

function editRestriccion(id, descripcion, estado) {
    window.restriccionEditingId = id;
    document.getElementById('restriccion-id').value = id;
    document.getElementById('restriccion-descripcion').value = descripcion;
    document.getElementById('restriccion-estado').checked = !!estado;
    document.getElementById('restriccion-modal-title').textContent = 'Editar Restricción';
    document.getElementById('modal-restriccion').style.display = 'flex';
}

async function saveRestriccion(e) {
    e.preventDefault();
    const descripcion = document.getElementById('restriccion-descripcion').value;
    const estado = document.getElementById('restriccion-estado').checked;

    const data = { descripcion, estado };

    try {
        if (window.restriccionEditingId) {
            await apiPut(`/restricciones-licencia/${window.restriccionEditingId}`, data);
            showNotification('success', 'Éxito', 'Restricción actualizada');
        } else {
            await apiPost('/restricciones-licencia', data);
            showNotification('success', 'Éxito', 'Restricción creada');
        }
        document.getElementById('modal-restriccion').style.display = 'none';
        loadRestricciones();
    } catch (error) {
        showNotification('error', 'Error', 'No se pudo guardar la restricción');
    }
}

// Exponer al scope global
window.loadRestricciones = loadRestricciones;
window.openModalRestriccion = openModalRestriccion;
window.editRestriccion = editRestriccion;
window.saveRestriccion = saveRestriccion;
