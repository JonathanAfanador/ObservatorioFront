// ============================================================
// upc-exportacion.js
// Exportación de datos a CSV, Excel y PDF. Resumen general.
// Requiere: PapaParse (CSV), SheetJS/XLSX (Excel), jsPDF + autoTable (PDF)
// ============================================================

// --- Helper: preparar datos y encabezados según la vista activa ---
function getExportConfig(target) {
    switch (target) {
        case 'empresas': {
            const searchTerm = document.getElementById('filter-empresas').value.toLowerCase();
            return {
                data: dashboardDataStore.empresas.filter(e =>
                    (e.name && e.name.toLowerCase().includes(searchTerm)) ||
                    (e.nit && e.nit.toLowerCase().includes(searchTerm))
                ),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'nit', label: 'NIT' },
                    { key: 'tipo_empresa.descripcion', label: 'Tipo' }
                ],
                title: 'Reporte de Empresas'
            };
        }
        case 'conductores': {
            const searchTerm = document.getElementById('filter-conductores').value.toLowerCase();
            return {
                data: dashboardDataStore.conductores.filter(c => {
                    const p = c.persona;
                    return (p && p.name && p.name.toLowerCase().includes(searchTerm)) ||
                        (p && p.last_name && p.last_name.toLowerCase().includes(searchTerm)) ||
                        (p && p.nui && p.nui.toLowerCase().includes(searchTerm));
                }),
                headers: [
                    { key: 'id', label: 'ID Conductor' },
                    { key: 'persona.name', label: 'Nombres' },
                    { key: 'persona.last_name', label: 'Apellidos' },
                    { key: 'persona.nui', label: 'Identificación' },
                    { key: 'persona.gender', label: 'Género' }
                ],
                title: 'Reporte de Conductores'
            };
        }
        case 'vehiculos': {
            const searchTerm = document.getElementById('filter-vehiculos').value.toLowerCase();
            return {
                data: dashboardDataStore.vehiculos.filter(v =>
                    (v.placa && v.placa.toLowerCase().includes(searchTerm)) ||
                    (v.marca && v.marca.toLowerCase().includes(searchTerm)) ||
                    (v.modelo && v.modelo.toLowerCase().includes(searchTerm))
                ),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'placa', label: 'Placa' },
                    { key: 'marca', label: 'Marca' },
                    { key: 'modelo', label: 'Modelo' },
                    { key: 'tipo_vehiculo.descripcion', label: 'Tipo' }
                ],
                title: 'Reporte de Vehículos en Servicio'
            };
        }
        case 'rutas': {
            const empId = document.getElementById('select-empresa-rutas').value;
            const searchTerm = document.getElementById('filter-rutas').value.toLowerCase();
            return {
                data: dashboardDataStore.rutas.filter(r => {
                    const matchEmpresa = !empId || (r.empresa_id == empId);
                    const matchText = !searchTerm || (r.name && r.name.toLowerCase().includes(searchTerm));
                    return matchEmpresa && matchText;
                }),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Nombre Ruta' },
                    { key: 'empresa.name', label: 'Empresa' },
                    { key: 'file_name', label: 'Archivo' }
                ],
                title: 'Reporte de Rutas'
            };
        }
        case 'documentos': {
            const tipoId = document.getElementById('select-tipo-docs').value;
            const searchTerm = document.getElementById('filter-documentos').value.toLowerCase();
            return {
                data: dashboardDataStore.documentos.filter(d => {
                    const matchTipo = !tipoId || (d.tipo_doc_id == tipoId);
                    const matchText = !searchTerm ||
                        (d.observaciones && d.observaciones.toLowerCase().includes(searchTerm)) ||
                        (d.url && d.url.toLowerCase().includes(searchTerm));
                    return matchTipo && matchText;
                }),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'observaciones', label: 'Observación' },
                    { key: 'url', label: 'URL' },
                    { key: 'created_at', label: 'Fecha Creación' }
                ],
                title: 'Reporte de Documentos'
            };
        }
        default:
            return null;
    }
}

// --- Configurar listeners de los botones de exportación ---
window.setupUpcListeners = function () {
    // Filtros de texto (keyup)
    document.getElementById('filter-empresas').addEventListener('keyup', renderEmpresasTable);
    document.getElementById('filter-conductores').addEventListener('keyup', renderConductoresTable);
    document.getElementById('filter-vehiculos').addEventListener('keyup', renderVehiculosTable);
    document.getElementById('filter-rutas').addEventListener('keyup', renderRutasTable);
    document.getElementById('filter-documentos').addEventListener('keyup', renderDocumentosTable);

    // Filtros de select (change)
    document.getElementById('select-empresa-rutas').addEventListener('change', renderRutasTable);
    document.getElementById('select-tipo-docs').addEventListener('change', renderDocumentosTable);

    // Botones de exportación (.btn-export)
    document.querySelectorAll('.btn-export').forEach(button => {
        button.addEventListener('click', (e) => {
            const format = e.currentTarget.dataset.format;
            const target = e.currentTarget.dataset.target;
            const config = getExportConfig(target);
            const filename = `${target}_reporte_${new Date().toISOString().split('T')[0]}`;

            if (!config || config.data.length === 0) {
                alert('No hay datos para exportar (según el filtro actual).');
                return;
            }

            if (format === 'csv') exportToCSV(config.data, config.headers, filename + '.csv');
            if (format === 'excel') exportToExcel(config.data, config.headers, filename + '.xlsx');
            if (format === 'pdf') exportToPDF(config.data, config.headers, filename + '.pdf', config.title);
        });
    });

    // Botón exportar resumen
    const summaryButton = document.getElementById('btn-export-summary');
    if (summaryButton) summaryButton.addEventListener('click', handleExportSummary);
};

// --- Exportar Resumen en PDF (manual con jsPDF) ---
window.handleExportSummary = function () {
    const exportButton = document.getElementById('btn-export-summary');
    if (exportButton) {
        exportButton.disabled = true;
        exportButton.querySelector('span').textContent = 'Generando...';
    }

    try {
        if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
            alert('Error: La librería jsPDF no está cargada.');
            throw new Error('jsPDF no definido');
        }

        const totalEmpresas = document.querySelector('.card-empresas .metric-value').textContent;
        const totalConductores = document.querySelector('.card-conductores .metric-value').textContent;
        const totalVehiculos = document.querySelector('.card-vehiculos .metric-value').textContent;
        const totalRutas = document.querySelector('.card-rutas .metric-value').textContent;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const docWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 30;

        doc.setFontSize(18); doc.setFont('helvetica', 'bold');
        doc.text('Resumen General del Sistema de Transporte', docWidth / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(11); doc.setFont('helvetica', 'normal');
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, margin, y);
        y += 15;

        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text('Métricas Principales', margin, y);
        y += 10;

        const cardWidth = docWidth - (margin * 2);
        const cardHeight = 15;
        const textOffset = 9;
        const valueOffset = docWidth - margin - 10;

        const metricas = [
            { label: 'Empresas Registradas:', value: totalEmpresas },
            { label: 'Conductores Registrados:', value: totalConductores },
            { label: 'Vehículos en Servicio:', value: totalVehiculos },
            { label: 'Rutas Autorizadas:', value: totalRutas }
        ];

        metricas.forEach(m => {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, y, cardWidth, cardHeight, 'F');
            doc.setFontSize(12); doc.setFont('helvetica', 'normal');
            doc.text(m.label, margin + 5, y + textOffset);
            doc.setFont('helvetica', 'bold');
            doc.text(m.value, valueOffset, y + textOffset, { align: 'right' });
            y += 20;
        });

        doc.save(`resumen_general_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
        console.error('Error al generar el PDF del resumen:', err);
        alert('No se pudo generar el PDF del resumen. Asegúrese de que el resumen esté cargado.');
    } finally {
        if (exportButton) {
            exportButton.disabled = false;
            exportButton.querySelector('span').textContent = 'Descargar Resumen';
        }
    }
};

// --- Exportar a CSV (requiere PapaParse) ---
window.exportToCSV = function (data, headers, filename) {
    if (typeof Papa === 'undefined') { alert('Error: La librería PapaParse (CSV) no está cargada.'); return; }
    const csvData = data.map(row => {
        let newRow = {};
        headers.forEach(h => { newRow[h.label] = getDeepValue(row, h.key); });
        return newRow;
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Exportar a Excel (requiere SheetJS/XLSX) ---
window.exportToExcel = function (data, headers, filename) {
    if (typeof XLSX === 'undefined') { alert('Error: La librería XLSX (Excel) no está cargada.'); return; }
    const excelData = data.map(row => {
        let newRow = {};
        headers.forEach(h => { newRow[h.label] = getDeepValue(row, h.key); });
        return newRow;
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = { Sheets: { 'Datos': worksheet }, SheetNames: ['Datos'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Exportar a PDF (requiere jsPDF + autoTable) ---
window.exportToPDF = function (data, headers, filename, title) {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') { alert('Error: La librería jsPDF no está cargada.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableHeaders = headers.map(h => h.label);
    const tableBody = data.map(row => headers.map(h => getDeepValue(row, h.key)));

    doc.text(title, 14, 20);
    doc.autoTable({
        startY: 25,
        head: [tableHeaders],
        body: tableBody,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 139, 230] }
    });
    doc.save(filename);
};
