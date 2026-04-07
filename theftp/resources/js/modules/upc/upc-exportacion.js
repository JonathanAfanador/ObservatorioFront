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
                title: 'Reporte de Auditoría de Empresas - Observatorio de Transporte'
            };
        }
        case 'conductores': {
            const searchTerm = document.getElementById('filter-conductores').value.toLowerCase();
            return {
                data: dashboardDataStore.conductores
                    .filter(c => {
                        const p = c.persona;
                        return (p && p.name && p.name.toLowerCase().includes(searchTerm)) ||
                            (p && p.last_name && p.last_name.toLowerCase().includes(searchTerm)) ||
                            (p && p.nui && p.nui.toLowerCase().includes(searchTerm));
                    })
                    .map(c => {
                        // Calcular estado para la exportación
                        let licStatus = 'Sin Licencia';
                        if (c.licencias && c.licencias.length > 0) {
                            const lic = c.licencias[0] || {};
                            const fv = lic.fecha_vencimiento;
                            if (fv) {
                                const diff = Math.ceil((new Date(fv) - new Date()) / (1000 * 60 * 60 * 24));
                                if (diff <= 0) licStatus = 'VENCIDA';
                                else if (diff <= 30) licStatus = 'POR VENCER';
                                else licStatus = 'VIGENTE';
                            } else {
                                licStatus = 'Registrada (Sin fecha)';
                            }
                        }
                        return { ...c, licencia_estado: licStatus };
                    }),
                headers: [
                    { key: 'id', label: 'ID Conductor' },
                    { key: 'persona.name', label: 'Nombres' },
                    { key: 'persona.last_name', label: 'Apellidos' },
                    { key: 'persona.nui', label: 'Identificación' },
                    { key: 'licencia_estado', label: 'Estado Licencia' },
                    { key: 'persona.gender', label: 'Género' }
                ],
                title: 'Reporte de Auditoría de Conductores - Observatorio de Transporte'
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
                    { key: 'tipo.descripcion', label: 'Tipo' }
                ],
                title: 'Reporte de Auditoría de Vehículos en Servicio - Observatorio de Transporte'
            };
        }
        case 'rutas': {
            const empId = document.getElementById('select-empresa-rutas').value;
            const searchTerm = document.getElementById('filter-rutas').value.toLowerCase();
            return {
                data: dashboardDataStore.rutas
                    .filter(r => {
                        const matchEmpresa = !empId || (r.empresa_id == empId);
                        const matchText = !searchTerm || (r.name && r.name.toLowerCase().includes(searchTerm));
                        return matchEmpresa && matchText;
                    })
                    .map(r => {
                        const f = r.file_name ? String(r.file_name).trim().toLowerCase() : '';
                        const blackList = ['undefined', 'null', 'n/a', 'none', 'no', 'default', 'error', 'vacio', 'pendiente', 'error.kml', 'ruta.kml'];
                        
                        const hasFile = f !== '' && 
                                      f.length > 5 && 
                                      !blackList.includes(f) && 
                                      !f.includes('undefined') &&
                                      (f.includes('.') || f.includes('/'));

                        const hasStops = r.paraderos && r.paraderos.length > 0;
                        
                        let estado = 'DOCUMENTADO';
                        if (!hasFile && !hasStops) estado = 'PENDIENTE TOTAL';
                        else if (!hasFile) estado = 'SIN TRAZADO KML';
                        else if (!hasStops) estado = 'SIN PARADEROS';

                        return {
                            ...r,
                            empresa_nombre: (r.empresas && r.empresas.length > 0) ? r.empresas[0].name : 'N/A',
                            estado_auditoria: estado,
                            cantidad_paraderos: r.paraderos ? r.paraderos.length : 0
                        };
                    }),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Nombre Ruta' },
                    { key: 'empresa_nombre', label: 'Empresa' },
                    { key: 'estado_auditoria', label: 'Estado Auditoría' },
                    { key: 'cantidad_paraderos', label: 'Paraderos Reg.' },
                    { key: 'file_name', label: 'Archivo Trazado' }
                ],
                title: 'Reporte de Auditoría de Rutas - Observatorio de Transporte'
            };
        }
        case 'documentos': {
            const tipoId = document.getElementById('select-tipo-docs').value;
            const searchTerm = document.getElementById('filter-documentos').value.toLowerCase();
            return {
                data: dashboardDataStore.documentos
                    .filter(d => {
                        const matchTipo = !tipoId || (d.tipo_doc_id == tipoId);
                        const matchText = !searchTerm ||
                            (d.observaciones && d.observaciones.toLowerCase().includes(searchTerm)) ||
                            (d.url && d.url.toLowerCase().includes(searchTerm));
                        return matchTipo && matchText;
                    })
                    .map(d => ({
                        ...d,
                        empresa_nombre: d.empresa ? d.empresa.name : 'N/A',
                        categoria_desc: d.tipo_documento ? d.tipo_documento.descripcion : 'SIN CATEGORÍA',
                        ha_sido_cargado: d.url ? 'SÍ (Documentado)' : 'NO'
                    })),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'empresa_nombre', label: 'Empresa Responsable' },
                    { key: 'categoria_desc', label: 'Categoría' },
                    { key: 'observaciones', label: 'Observación' },
                    { key: 'ha_sido_cargado', label: 'Estado de Evidencia' },
                    { key: 'created_at', label: 'Fecha Registro' }
                ],
                title: 'Reporte de Auditoría de Documentos y Resoluciones - Observatorio de Transporte'
            };
        }
        default:
            return null;
    }
}

// --- Configurar listeners de los botones de exportación ---
window.setupUpcListeners = function () {
    // Filtros de texto (keyup)
    document.getElementById('filter-empresas').addEventListener('keyup', () => { 
        dashboardDataStore.pagination.empresas.current = 1; renderEmpresasTable(); 
    });
    document.getElementById('filter-conductores').addEventListener('keyup', () => { 
        dashboardDataStore.pagination.conductores.current = 1; renderConductoresTable(); 
    });
    document.getElementById('filter-vehiculos').addEventListener('keyup', () => { 
        dashboardDataStore.pagination.vehiculos.current = 1; renderVehiculosTable(); 
    });
    document.getElementById('filter-rutas').addEventListener('keyup', () => { 
        dashboardDataStore.pagination.rutas.current = 1; renderRutasTable(); 
    });
    document.getElementById('filter-documentos').addEventListener('keyup', () => { 
        dashboardDataStore.pagination.documentos.current = 1; renderDocumentosTable(); 
    });

    // Filtros de select (change)
    document.getElementById('select-empresa-rutas').addEventListener('change', () => { 
        dashboardDataStore.pagination.rutas.current = 1; renderRutasTable(); 
    });
    document.getElementById('select-tipo-docs').addEventListener('change', () => { 
        dashboardDataStore.pagination.documentos.current = 1; renderDocumentosTable(); 
    });

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

            if (format === 'csv') exportToCSV(config.data, config.headers, filename + '.csv', config.title);
            if (format === 'excel') exportToExcel(config.data, config.headers, filename + '.xlsx', config.title);
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
window.exportToCSV = function (data, headers, filename, title) {
    if (typeof Papa === 'undefined') { alert('Error: La librería PapaParse (CSV) no está cargada.'); return; }
    
    // Preparar datos con encabezados amigables
    const csvRows = data.map(row => {
        let newRow = {};
        headers.forEach(h => { newRow[h.label] = getDeepValue(row, h.key); });
        return newRow;
    });

    // Añadimos el título como primera fila (opcional, pero solicitado como "encabezado")
    let csv = title + "\n\n";
    csv += Papa.unparse(csvRows);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.click();
};

// --- Exportar a Excel (requiere SheetJS/XLSX) ---
window.exportToExcel = function (data, headers, filename, title) {
    if (typeof XLSX === 'undefined') { alert('Error: La librería XLSX (Excel) no está cargada.'); return; }
    
    const excelRows = data.map(row => {
        let newRow = {};
        headers.forEach(h => { newRow[h.label] = getDeepValue(row, h.key); });
        return newRow;
    });

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(excelRows, { origin: "A3" });
    
    // Añadir el título en la celda A1
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoría');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.click();
};

// --- Exportar a PDF (requiere jsPDF + autoTable) ---
window.exportToPDF = function (data, headers, filename, title) {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') { alert('Error: La librería jsPDF no está cargada.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableHeaders = headers.map(h => h.label);
    const tableBody = data.map(row => headers.map(h => getDeepValue(row, h.key)));

    // Estilo del Título
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(title, 14, 15);
    
    // Fecha y subtítulo
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado por el Sistema Observatorio - ${new Date().toLocaleDateString('es-CO')}`, 14, 22);

    doc.autoTable({
        startY: 28,
        head: [tableHeaders],
        body: tableBody,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] }
    });
    doc.save(filename);
};
