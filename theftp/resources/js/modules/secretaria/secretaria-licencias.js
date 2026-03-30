// ============================================================
// secretaria-licencias.js
// Auditoría y Verificación de Licencias por el Tránsito
// ============================================================

window.loadLicenciasAudit = async function () {
    const container = document.getElementById('licencias-audit-table');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><p>Cargando licencias...</p></div>';

    try {
        // Cargar licencias con conductor y categoría
        const resp = await apiCall('/conductores-licencias?include=conductor.persona,licencia.categoria');
        const lics = normalizeList(resp);

        if (lics.length === 0) {
            container.innerHTML = '<p class="p-4 text-center text-gray-500">No hay licencias registradas para auditar.</p>';
            return;
        }

        let html = `
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Conductor</th>
                        <th>Nro. Licencia</th>
                        <th>Categoría</th>
                        <th>Vencimiento</th>
                        <th>Autoridad</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        lics.forEach(l => {
            const lic = l.licencia || {};
            const p = l.conductor?.persona || {};
            const nombre = `${p.name || ''} ${p.last_name || ''}`.trim() || 'Desconocido';
            
            // Semaforización
            let color = 'text-green-600';
            let label = 'Vigente';
            const fv = lic.fecha_vencimiento;
            if (fv) {
                const diff = Math.ceil((new Date(fv) - new Date()) / (1000 * 60 * 60 * 24));
                if (diff <= 0) { color = 'text-red-600 font-bold'; label = 'Vencida'; }
                else if (diff <= 30) { color = 'text-yellow-600 font-bold'; label = 'Por vencer'; }
            }

            const verificado = lic.verificado_secretaria;

            html += `
                <tr>
                    <td>${nombre}</td>
                    <td>${lic.numero || '-'}</td>
                    <td>${lic.categoria?.codigo || '-'}</td>
                    <td class="${color}">${fv || '-'}</td>
                    <td>${lic.organismo_transito || '-'}</td>
                    <td>
                        <span class="badge ${verificado ? 'badge-success' : 'badge-warning'}">
                            ${verificado ? 'Verificada' : 'Pendiente'}
                        </span>
                    </td>
                    <td>
                        ${!verificado ? `
                            <button class="btn-primary" onclick="verificarLicencia(${lic.id})" style="padding: 2px 8px; font-size: 0.7rem;">
                                Verificar
                            </button>
                        ` : `
                            <span class="text-green-500">✓ OK</span>
                        `}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (e) {
        console.error('Error licencias audit:', e);
        container.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
};

window.verificarLicencia = async function (licenciaId) {
    if (!confirm('¿Confirmar que la licencia ha sido verificada en RUNT/SIMIT?')) return;

    try {
        const res = await apiCall(`/licencias/${licenciaId}`, 'PUT', {
            verificado_secretaria: true
        });

        if (res) {
            showNotification('success', '¡Éxito!', 'Licencia verificada exitosamente.');
            loadLicenciasAudit();
        }
    } catch (e) {
        showNotification('error', 'Error', 'No se pudo verificar la licencia.');
    }
};
