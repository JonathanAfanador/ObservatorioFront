<x-layouts.dashboard>

    <!-- Notification Container -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"></div>

    <!-- UPC - Dashboard: Panel de Consulta y Estadísticas (solo lectura) -->

    <!-- 1. Vista Overview (resumen con totales) -->
<div id="view-overview" class="dashboard-view">
        <div class="content-card">

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Resumen General</h2>
                    <p class="text-gray-600 mb-4">Visualización consolidada de las métricas principales.</p>
                </div>
                <div class="export-buttons">
                    <button id="btn-export-summary" class="btn-export" data-format="pdf" title="Descargar Resumen en PDF" style="background-color: #7C3AED; border-color: #6D28D9;">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 1.25em; height: 1.25em;">
                            <path d="M19,9H15V3H9V9H5L12,16L19,9M5,18V20H19V18H5Z" />
                        </svg>
                        <span>Descargar Resumen</span>
                    </button>
                </div>
            </div>

            <div id="upc-cards" class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                </div>
        </div>
    </div>

    <!-- 2. Empresas -->
<div id="view-empresas" class="dashboard-view" style="display:none;">
    <div class="content-card">

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
                <h2 class="content-title">Empresas de Transporte</h2>
                <p class="text-gray-600 mb-4">Consulta el registro completo de empresas de transporte registradas en el sistema.</p>
            </div>
            <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="empresas" title="Exportar a CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M12.5 11.5H14.5V12.5H12.5V14H14.5V15H12.5V17H11V11.5H12.5M15 11.5H17Q17.43 11.5 17.71 11.79Q18 12.07 18 12.5Q18 12.93 17.71 13.21Q17.43 13.5 17 13.5H15V15H17Q17.43 15 17.71 15.29Q18 15.57 18 16Q18 16.43 17.71 16.71Q17.43 17 17 17H15V11.5Z" /></svg>
                        <span>CSV</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="empresas" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M12.9 15.9H11.5L9.6 19H8L10.8 14L8 11H9.6L11.4 14.2L13.2 11H14.8L12.1 15L14.8 19H13.2L12.9 15.9Z" /></svg>
                        <span>Excel</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="empresas" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M13.25 11.5Q14 11.5 14.38 11.88Q14.75 12.25 14.75 13Q14.75 13.75 14.38 14.13Q14 14.5 13.25 14.5H12V17H10.5V11.5H13.25M12 13V13.5H13.25Q13.5 13.5 13.63 13.38Q13.75 13.25 13.75 13Q13.75 12.75 13.63 12.63Q13.5 12.5 13.25 12.5H12V13M15.5 11.5H17.5V12.5H15.5V14H17.5V15H15.5V17H14V11.5H15.5Z" /></svg>
                        <span>PDF</span>
                    </button>
                </div>
        </div>

        <div class="filter-bar" style="margin-top: 1rem;">
            <input type="text" id="filter-empresas" placeholder="Filtrar por nombre o NIT..." class="form-input" style="width: 100%;">
        </div>

        <div id="empresas-table" style="margin-top: 1rem;"></div>
    </div>
</div>

    <!-- 3. Conductores -->
<div id="view-conductores" class="dashboard-view" style="display:none;">
    <div class="content-card">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
                <h2 class="content-title">Conductores</h2>
                <p class="text-gray-600 mb-4">Directorio de conductores habilitados con información de licencias y estado actual.</p>
            </div>
            <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="conductores" title="Exportar a CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M12.5 11.5H14.5V12.5H12.5V14H14.5V15H12.5V17H11V11.5H12.5M15 11.5H17Q17.43 11.5 17.71 11.79Q18 12.07 18 12.5Q18 12.93 17.71 13.21Q17.43 13.5 17 13.5H15V15H17Q17.43 15 17.71 15.29Q18 15.57 18 16Q18 16.43 17.71 16.71Q17.43 17 17 17H15V11.5Z" /></svg>
                        <span>CSV</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="conductores" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M12.9 15.9H11.5L9.6 19H8L10.8 14L8 11H9.6L11.4 14.2L13.2 11H14.8L12.1 15L14.8 19H13.2L12.9 15.9Z" /></svg>
                        <span>Excel</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="conductores" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M13.25 11.5Q14 11.5 14.38 11.88Q14.75 12.25 14.75 13Q14.75 13.75 14.38 14.13Q14 14.5 13.25 14.5H12V17H10.5V11.5H13.25M12 13V13.5H13.25Q13.5 13.5 13.63 13.38Q13.75 13.25 13.75 13Q13.75 12.75 13.63 12.63Q13.5 12.5 13.25 12.5H12V13M15.5 11.5H17.5V12.5H15.5V14H17.5V15H15.5V17H14V11.5H15.5Z" /></svg>
                        <span>PDF</span>
                    </button>
                </div>
        </div>

        <div class="filter-bar" style="margin-top: 1rem;">
            <input type="text" id="filter-conductores" placeholder="Filtrar por nombre, apellido o identificación..." class="form-input" style="width: 100%;">
        </div>

        <div id="conductores-table" style="margin-top: 1rem;"></div>
    </div>
</div>

    <!-- 4. Vehículos (con filtro servicio=true) -->
    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
    <div class="content-card">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
                <h2 class="content-title">Vehículos en Servicio</h2>
                <p class="text-gray-600 mb-4">Registro de vehículos habilitados actualmente en servicio de transporte público.</p>
            </div>
            <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="vehiculos" title="Exportar a CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M12.5 11.5H14.5V12.5H12.5V14H14.5V15H12.5V17H11V11.5H12.5M15 11.5H17Q17.43 11.5 17.71 11.79Q18 12.07 18 12.5Q18 12.93 17.71 13.21Q17.43 13.5 17 13.5H15V15H17Q17.43 15 17.71 15.29Q18 15.57 18 16Q18 16.43 17.71 16.71Q17.43 17 17 17H15V11.5Z" /></svg>
                        <span>CSV</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="vehiculos" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M12.9 15.9H11.5L9.6 19H8L10.8 14L8 11H9.6L11.4 14.2L13.2 11H14.8L12.1 15L14.8 19H13.2L12.9 15.9Z" /></svg>
                        <span>Excel</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="vehiculos" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M13.25 11.5Q14 11.5 14.38 11.88Q14.75 12.25 14.75 13Q14.75 13.75 14.38 14.13Q14 14.5 13.25 14.5H12V17H10.5V11.5H13.25M12 13V13.5H13.25Q13.5 13.5 13.63 13.38Q13.75 13.25 13.75 13Q13.75 12.75 13.63 12.63Q13.5 12.5 13.25 12.5H12V13M15.5 11.5H17.5V12.5H15.5V14H17.5V15H15.5V17H14V11.5H15.5Z" /></svg>
                        <span>PDF</span>
                    </button>
                </div>
        </div>

        <div class="filter-bar" style="margin-top: 1rem;">
            <input type="text" id="filter-vehiculos" placeholder="Filtrar por placa, marca o modelo..." class="form-input" style="width: 100%;">
        </div>

        <div id="vehiculos-table" style="margin-top: 1rem;"></div>
    </div>
</div>

    <!-- 5. Rutas (selector de empresa) -->
    <div id="view-rutas" class="dashboard-view" style="display:none;">
    <div class="content-card">

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
                <h2 class="content-title">Rutas Autorizadas</h2>
                <p class="text-gray-600 mb-4">Consulta las rutas de transporte autorizadas. Filtra por empresa o nombre.</p>
            </div>
             <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="rutas" title="Exportar a CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M12.5 11.5H14.5V12.5H12.5V14H14.5V15H12.5V17H11V11.5H12.5M15 11.5H17Q17.43 11.5 17.71 11.79Q18 12.07 18 12.5Q18 12.93 17.71 13.21Q17.43 13.5 17 13.5H15V15H17Q17.43 15 17.71 15.29Q18 15.57 18 16Q18 16.43 17.71 16.71Q17.43 17 17 17H15V11.5Z" /></svg>
                        <span>CSV</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="rutas" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M12.9 15.9H11.5L9.6 19H8L10.8 14L8 11H9.6L11.4 14.2L13.2 11H14.8L12.1 15L14.8 19H13.2L12.9 15.9Z" /></svg>
                        <span>Excel</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="rutas" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M13.25 11.5Q14 11.5 14.38 11.88Q14.75 12.25 14.75 13Q14.75 13.75 14.38 14.13Q14 14.5 13.25 14.5H12V17H10.5V11.5H13.25M12 13V13.5H13.25Q13.5 13.5 13.63 13.38Q13.75 13.25 13.75 13Q13.75 12.75 13.63 12.63Q13.5 12.5 13.25 12.5H12V13M15.5 11.5H17.5V12.5H15.5V14H17.5V15H15.5V17H14V11.5H15.5Z" /></svg>
                        <span>PDF</span>
                    </button>
                </div>
        </div>

        <div class="filter-bar" style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <input type="text" id="filter-rutas" placeholder="Filtrar por nombre de ruta..." class="form-input" style="width: 100%;">

            <div style="display:flex; gap: 1rem; align-items: center;">
                <label for="select-empresa-rutas" class="text-sm font-medium text-gray-700 flex-shrink-0">Empresa:</label>
                <select id="select-empresa-rutas" class="form-input" style="width: 100%;">
                    <option value="">Todas las empresas</option>
                </select>
            </div>
        </div>

        <div id="rutas-table" style="margin-top: 1rem;"></div>
    </div>
</div>

    <!-- 6. Documentos (filtrado por tipo_doc_id para resoluciones) -->
    <div id="view-documentos" class="dashboard-view" style="display:none;">
    <div class="content-card">

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
                <h2 class="content-title">Documentos y Resoluciones</h2>
                <p class="text-gray-600 mb-4">Acceso al repositorio de documentos oficiales y resoluciones administrativas.</p>
            </div>
            <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="documentos" title="Exportar a CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M12.5 11.5H14.5V12.5H12.5V14H14.5V15H12.5V17H11V11.5H12.5M15 11.5H17Q17.43 11.5 17.71 11.79Q18 12.07 18 12.5Q18 12.93 17.71 13.21Q17.43 13.5 17 13.5H15V15H17Q17.43 15 17.71 15.29Q18 15.57 18 16Q18 16.43 17.71 16.71Q17.43 17 17 17H15V11.5Z" /></svg>
                        <span>CSV</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="documentos" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M12.9 15.9H11.5L9.6 19H8L10.8 14L8 11H9.6L11.4 14.2L13.2 11H14.8L12.1 15L14.8 19H13.2L12.9 15.9Z" /></svg>
                        <span>Excel</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="documentos" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9.5 11.5Q10.25 11.5 10.63 11.88Q11 12.25 11 13Q11 13.75 10.63 14.13Q10.25 14.5 9.5 14.5H8.5V17H7V11.5H9.5M8.5 13V13.5H9.5Q9.75 13.5 9.88 13.38Q10 13.25 10 13Q10 12.75 9.88 12.63Q9.75 12.5 9.5 12.5H8.5V13M13.25 11.5Q14 11.5 14.38 11.88Q14.75 12.25 14.75 13Q14.75 13.75 14.38 14.13Q14 14.5 13.25 14.5H12V17H10.5V11.5H13.25M12 13V13.5H13.25Q13.5 13.5 13.63 13.38Q13.75 13.25 13.75 13Q13.75 12.75 13.63 12.63Q13.5 12.5 13.25 12.5H12V13M15.5 11.5H17.5V12.5H15.5V14H17.5V15H15.5V17H14V11.5H15.5Z" /></svg>
                        <span>PDF</span>
                    </button>
                </div>
        </div>

        <div class="filter-bar" style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <input type="text" id="filter-documentos" placeholder="Filtrar por observación o URL..." class="form-input" style="width: 100%;">

            <div style="display:flex; gap: 1rem; align-items: center;">
                <label for="select-tipo-docs" class="text-sm font-medium text-gray-700 flex-shrink-0">Tipo:</label>
                <select id="select-tipo-docs" class="form-input" style="width: 100%;"></select>
            </div>
        </div>

        <div id="documentos-table" style="margin-top: 1rem;"></div>
    </div>
</div>

    <!-- 7. Estadísticas y Análisis -->

 <div id="view-estadisticas" class="dashboard-view" style="display:none;">
    <div class="content-card">
        <h2 class="content-title">Estadísticas y Análisis</h2>
        <p class="text-gray-600 mb-4">Panel de análisis con métricas y estadísticas consolidadas del sistema de transporte.</p>

        <div id="estadisticas-container" style="margin-top:1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">

            <div class="chart-container" style="position: relative; height:300px; padding: 1rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 class="text-lg font-semibold text-center mb-3">Vehículos en Servicio por Tipo</h3>
                <canvas id="graficoVehiculosPorTipo"></canvas>
            </div>

            <div class="chart-container" style="position: relative; height:300px; padding: 1rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 class="text-lg font-semibold text-center mb-3">Conductores por Género</h3>
                <canvas id="graficoConductoresPorGenero"></canvas>
            </div>

            <div class="chart-container" style="position: relative; height:350px; padding: 1rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 class="text-lg font-semibold text-center mb-3">Empresas por Tipo</h3>
                <canvas id="graficoEmpresasPorTipo"></canvas>
            </div>

            <div class="chart-container" style="position: relative; height:350px; padding: 1rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 class="text-lg font-semibold text-center mb-3">Flota de Vehículos por Modelo (Año)</h3>
                <canvas id="graficoVehiculosPorModelo"></canvas>
            </div>

            <div class="chart-container" style="position: relative; height:350px; padding: 1rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 class="text-lg font-semibold text-center mb-3">Rutas por Empresa (Top 10)</h3>
                <canvas id="graficoRutasPorEmpresa"></canvas>
            </div>

        </div>
    </div>
</div>
    {{-- Cargar JavaScript específico del dashboard UPC --}}
    @vite(['resources/js/dashboard-upc.js'])

</x-layouts.dashboard>
