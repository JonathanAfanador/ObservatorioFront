// ============================================================
// secretaria-vehiculos.js
// Revisión de Documentación Vehicular (SOAT + Tecnomecánica)
// ============================================================

window.loadVehiculosReview = async function () {
    const container = document.getElementById('vehiculos-review-table');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><p>Cargando vehículos...</p></div>';

    try {
        const resp = await apiCall('/vehiculos?include=tipo,documentoSoat,documentoTecno');
        const vehiculos = normalizeList(resp);

        if (vehiculos.length === 0) {
            container.innerHTML = '<p class="p-4 text-center text-gray-500">No hay vehículos registrados para revisar.</p>';
            return;
        }

        const hoy = new Date();

        let html = `
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Tipo</th>
                        <th>SOAT</th>
                        <th>Doc. SOAT</th>
                        <th>Tecnomecánica</th>
                        <th>Doc. Tecno</th>
                        <th>Servicio</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        vehiculos.forEach(v => {
            const tipo = v.tipo?.descripcion || '-';

            // Semaforización SOAT
            let soatColor = 'text-gray-500';
            let soatLabel = 'N/A';
            const fvSoat = v.fecha_vencimiento_soat;
            if (fvSoat) {
                const diff = Math.ceil((new Date(fvSoat) - hoy) / (1000 * 60 * 60 * 24));
                if (diff <= 0) { soatColor = 'text-red-600 font-bold'; soatLabel = 'Vencido'; }
                else if (diff <= 30) { soatColor = 'text-yellow-600 font-bold'; soatLabel = 'Por vencer'; }
                else { soatColor = 'text-green-600'; soatLabel = 'Vigente'; }
                soatLabel = `${fvSoat.split('T')[0]} (${soatLabel})`;
            }

            // Semaforización Tecno
            let tecnoColor = 'text-gray-500';
            let tecnoLabel = 'N/A';
            const fvTecno = v.fecha_vencimiento_tecno;
            if (fvTecno) {
                const diff = Math.ceil((new Date(fvTecno) - hoy) / (1000 * 60 * 60 * 24));
                if (diff <= 0) { tecnoColor = 'text-red-600 font-bold'; tecnoLabel = 'Vencido'; }
                else if (diff <= 30) { tecnoColor = 'text-yellow-600 font-bold'; tecnoLabel = 'Por vencer'; }
                else { tecnoColor = 'text-green-600'; tecnoLabel = 'Vigente'; }
                tecnoLabel = `${fvTecno.split('T')[0]} (${tecnoLabel})`;
            }

            // Documentos adjuntos
            const docSoat = v.documento_soat || v.documentoSoat;
            const docTecno = v.documento_tecno || v.documentoTecno;
            const docSoatUrl = docSoat ? docSoat.url : null;
            const docTecnoUrl = docTecno ? docTecno.url : null;

            const soatLink = docSoatUrl
                ? `<a href="${docSoatUrl}" target="_blank" class="text-blue-600 hover:underline" style="font-size:0.8rem;">Ver / Descargar</a>`
                : '<span class="text-red-500" style="font-size:0.8rem;">No adjunto</span>';

            const tecnoLink = docTecnoUrl
                ? `<a href="${docTecnoUrl}" target="_blank" class="text-blue-600 hover:underline" style="font-size:0.8rem;">Ver / Descargar</a>`
                : '<span class="text-red-500" style="font-size:0.8rem;">No adjunto</span>';

            const enServicio = v.servicio === true || v.servicio === 1 || String(v.servicio) === '1';

            html += `
                <tr>
                    <td style="font-weight:700;">${v.placa || '-'}</td>
                    <td>${tipo}</td>
                    <td class="${soatColor}">${soatLabel}</td>
                    <td>${soatLink}</td>
                    <td class="${tecnoColor}">${tecnoLabel}</td>
                    <td>${tecnoLink}</td>
                    <td>
                        <span class="badge ${enServicio ? 'badge-success' : 'badge-warning'}">
                            ${enServicio ? 'Aprobado' : 'Pendiente'}
                        </span>
                    </td>
                    <td>
                        ${!enServicio ? `
                            <button class="btn-primary" onclick="aprobarServicioVehiculo(${v.id})" style="padding: 2px 8px; font-size: 0.7rem;">
                                Aprobar
                            </button>
                        ` : `
                            <button class="btn-secondary" onclick="rechazarServicioVehiculo(${v.id}, '${v.placa || ''}')" style="padding: 2px 8px; font-size: 0.7rem;">
                                Inmovilizar
                            </button>
                        `}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (e) {
        console.error('Error vehiculos review:', e);
        container.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
};

window.aprobarServicioVehiculo = async function (vehiculoId) {
    if (!confirm('¿Confirmar que la documentación ha sido revisada y el vehículo puede estar en servicio?')) return;

    try {
        const res = await apiCall(`/vehiculos/${vehiculoId}`, 'PUT', {
            servicio: true
        });
        if (res) {
            showNotification('success', '¡Éxito!', 'Vehículo aprobado para servicio.');
            loadVehiculosReview();
        }
    } catch (e) {
        showNotification('error', 'Error', 'No se pudo aprobar el vehículo: ' + e.message);
    }
};

window.rechazarServicioVehiculo = async function (vehiculoId, placa) {
    // Abrir Modal
    document.getElementById('vehiculo-id-rechazo').value = vehiculoId;
    document.getElementById('placa-rechazo').textContent = placa || 'N/A';
    document.getElementById('motivo-rechazo').value = '';
    document.getElementById('detalle-rechazo').value = '';
    document.getElementById('modal-rechazo-vehiculo').style.display = 'flex';
};

// --- Procesar formulario de Rechazo (Inmovilización) ---
document.getElementById('form-rechazo-vehiculo')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const vehiculoId = document.getElementById('vehiculo-id-rechazo').value;
    const motivoSelect = document.getElementById('motivo-rechazo').value;
    const detalle = document.getElementById('detalle-rechazo').value;
    
    const textoMotivo = `[AUTORIDAD] ${motivoSelect} - ${detalle}`;

    try {
        const res = await window.apiPut(`/vehiculos/${vehiculoId}`, {
            servicio: false,
            estado: 'Inmovilizado',
            motivo_estado: textoMotivo
        });

        if (res) {
            showNotification('success', 'Vehículo Inmovilizado', 'Se ha revocado la autorización de rodamiento para este vehículo.');
            document.getElementById('modal-rechazo-vehiculo').style.display = 'none';
            loadVehiculosReview();
        }
    } catch (e) {
        showNotification('error', 'Error en Auditoría', 'No se pudo inmovilizar el vehículo: ' + e.message);
    }
});
