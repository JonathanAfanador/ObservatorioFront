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
                        return { 
                            ...c, 
                            empresa_nombre: c.empresa ? c.empresa.name : 'N/A',
                            licencia_estado: licStatus,
                            verificado_st: (c.licencias && c.licencias.length > 0 && c.licencias[0].verificado_secretaria) ? 'VALIDADO' : 'PENDIENTE'
                        };
                    }),
                headers: [
                    { key: 'id', label: 'ID Conductor' },
                    { key: 'empresa_nombre', label: 'Empresa' },
                    { key: 'persona.name', label: 'Nombres' },
                    { key: 'persona.last_name', label: 'Apellidos' },
                    { key: 'persona.nui', label: 'Identificación' },
                    { key: 'licencia_estado', label: 'Estado Licencia' },
                    { key: 'verificado_st', label: 'Estado ST (Validación)' }
                ],
                title: 'Reporte de Auditoría de Conductores - Observatorio de Transporte'
            };
        }
        case 'vehiculos': {
            const searchTerm = document.getElementById('filter-vehiculos').value.toLowerCase();
            return {
                data: dashboardDataStore.vehiculos
                    .filter(v =>
                        (v.placa && v.placa.toLowerCase().includes(searchTerm)) ||
                        (v.marca && v.marca.toLowerCase().includes(searchTerm)) ||
                        (v.modelo && v.modelo.toLowerCase().includes(searchTerm))
                    )
                    .map(v => ({
                        ...v,
                        empresa_nombre: v.empresa ? v.empresa.name : 'N/A',
                        en_servicio_empresa: v.servicio ? 'SÍ' : 'NO',
                        estado_st: v.estado || 'PENDIENTE',
                        tipo_nombre: v.tipo ? v.tipo.descripcion : 'N/A'
                    })),
                headers: [
                    { key: 'id', label: 'ID' },
                    { key: 'empresa_nombre', label: 'Empresa' },
                    { key: 'placa', label: 'Placa' },
                    { key: 'tipo_nombre', label: 'Tipo' },
                    { key: 'en_servicio_empresa', label: 'Servicio (Empresa)' },
                    { key: 'estado_st', label: 'Estado (Secretaría)' }
                ],
                title: 'Reporte de Auditoría de Vehículos - Observatorio de Transporte'
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

        const totalEmpresas = document.getElementById('upc-total-empresas')?.textContent || '0';
        const totalConductores = document.getElementById('upc-total-conductores')?.textContent || '0';
        const totalVehiculos = document.getElementById('upc-total-vehiculos')?.textContent || '0';
        const totalRutas = document.getElementById('upc-total-rutas')?.textContent || '0';

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const docWidth = doc.internal.pageSize.getWidth();
        const docHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let y = 30;

        // --- PÁGINA 1: RESUMEN EJECUTIVO Y KPIs ---
        doc.setFillColor(59, 130, 246); // Color primario
        doc.rect(margin, y - 5, 2, 8, 'F');
        doc.setFontSize(18); doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); 
        doc.text('Informe Estratégico de Gestión', margin + 6, y);
        y += 10;

        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Módulo UPC - Generado el: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString()}`, margin, y);
        y += 20;

        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Indicadores Clave de Desempeño (KPIs)', margin, y);
        y += 10;

        const cardWidth = (docWidth - (margin * 2) - 10) / 2;
        const cardHeight = 25;
        const metrics = [
            { label: 'Empresas Registradas', value: totalEmpresas },
            { label: 'Conductores Registrados', value: totalConductores },
            { label: 'Flota en Servicio', value: totalVehiculos },
            { label: 'Rutas Autorizadas', value: totalRutas }
        ];

        metrics.forEach((m, i) => {
            const posX = margin + (i % 2 === 0 ? 0 : cardWidth + 10);
            const posY = y + (Math.floor(i / 2) * (cardHeight + 10));
            
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(posX, posY, cardWidth, cardHeight, 2, 2, 'FD');
            
            doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.setTextColor(100);
            doc.text(m.label.toUpperCase(), posX + 5, posY + 8);
            
            doc.setFontSize(16); doc.setTextColor(15, 23, 42);
            doc.text(m.value, posX + 5, posY + 18);
        });
        
        y += (cardHeight * 2) + 15;

        // --- SECCIÓN: INTELIGENCIA OPERATIVA Y RIESGOS ---
        const audit = dashboardDataStore.lastAudit;
        if (audit) {
            const sColor = scoreColor(audit.score);
            doc.setFillColor(sColor[0], sColor[1], sColor[2]); 
            doc.rect(margin, y - 5, 2, 8, 'F');
            doc.setFontSize(14); doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Análisis de Cumplimiento y Riesgos', margin + 6, y);
            y += 10;

            // Banner de Salud del Sistema
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, y, docWidth - (margin * 2), 15, 2, 2, 'FD');
            
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.setTextColor(71, 85, 105);
            doc.text('ÍNDICE DE SALUD OPERATIVA:', margin + 5, y + 9.5);
            
            doc.setFontSize(14); doc.setTextColor(15, 23, 42);
            doc.text(`${audit.score}%`, docWidth - margin - 15, y + 10, { align: 'right' });
            
            y += 22;

            if (audit.hallazgos.length > 0) {
                audit.hallazgos.forEach(h => {
                    const hColor = h.type === 'critical' ? [185, 28, 28] : (h.type === 'warning' ? [180, 83, 9] : [3, 105, 161]);
                    
                    doc.setDrawColor(226, 232, 240);
                    doc.setLineWidth(0.1);
                    doc.line(margin, y, docWidth - margin, y);
                    y += 6;

                    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
                    doc.setTextColor(hColor[0], hColor[1], hColor[2]);
                    doc.text(h.title.toUpperCase(), margin, y);
                    y += 5;

                    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
                    doc.setTextColor(71, 85, 105);
                    const splitDesc = doc.splitTextToSize(h.desc.replace(/<\/?strong>/g, ''), docWidth - (margin * 2));
                    doc.text(splitDesc, margin, y);
                    y += (splitDesc.length * 5) + 3;
                });
            } else {
                doc.setFontSize(10); doc.setFont('helvetica', 'italic');
                doc.setTextColor(100);
                doc.text('No se detectaron inconsistencias legales ni riesgos operativos vigentes.', margin, y);
                y += 10;
            }
        }

        function scoreColor(s) {
            if (s > 90) return [16, 185, 129];
            if (s > 60) return [245, 158, 11];
            return [239, 68, 68];
        }

        // --- PÁGINA 2: ANÁLISIS ANALÍTICO (GRÁFICOS) ---
        doc.addPage();
        y = 25;
        
        doc.setFillColor(99, 102, 241); 
        doc.rect(margin, y - 5, 2, 8, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); 
        doc.text('Análisis Operativo Visual', margin + 6, y);
        y += 15;

        const chartIds = [
            { id: 'graficoVehiculosPorTipo', title: 'Distribución de Flota por Tipo' },
            { id: 'graficoConductoresPorGenero', title: 'Demografía de Conductores' },
            { id: 'graficoEmpresasPorTipo', title: 'Composición Empresarial' },
            { id: 'graficoVehiculosPorModelo', title: 'Antigüedad/Modelo de Flota' }
        ];

        const chartW = (docWidth - (margin * 2) - 10) / 2;
        const chartH = 65;

        chartIds.forEach((chart, i) => {
            const canvas = document.getElementById(chart.id);
            if (canvas) {
                const posX = margin + (i % 2 === 0 ? 0 : chartW + 10);
                const posY = y + (Math.floor(i / 2) * (chartH + 15));
                
                doc.setFontSize(10); doc.setFont('helvetica', 'bold');
                doc.setTextColor(71, 85, 105);
                doc.text(chart.title, posX, posY - 5);
                
                try {
                    const imgData = canvas.toDataURL('image/png', 1.0);
                    doc.addImage(imgData, 'PNG', posX, posY, chartW, chartH);
                } catch (e) {
                    doc.setFontSize(8); doc.setTextColor(200, 0, 0);
                    doc.text('[Error al capturar analítica]', posX + 5, posY + 10);
                }
            }
        });

        // Pie de página institucional
        doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Observatorio de Transporte - Informe Confidencial de Auditoría', docWidth / 2, docHeight - 10, { align: 'center' });

        doc.save(`informe_estrategetico_upc_${new Date().toISOString().split('T')[0]}.pdf`);
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
