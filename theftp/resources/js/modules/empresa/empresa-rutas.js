// ==========================
// 5. GESTIÓN DE RUTAS
// ==========================
async function loadRutas() {
  const container = document.getElementById('rutas-table');
  container.innerHTML = '<p class="text-center py-4 text-gray-500">Cargando rutas de la empresa...</p>';

  let endpoint = '/rutas?include=empresa';

  // FILTRO AUTOMÁTICO: Si tengo empresa ID, solo traigo las mías
  if (myEmpresaId) {
    const filtro = encodeURIComponent(JSON.stringify([{
      "column": "empresa_id"
      , "operator": "="
      , "value": myEmpresaId
    }]));
    endpoint += `&filter=${filtro}`;
  }

  const response = await apiGet(endpoint);
  const rutas = normalizeList(response);

  if (rutas.length === 0) {
    container.innerHTML = '<div class="text-center py-8 bg-gray-50 rounded text-gray-500">No tienes rutas registradas.</div>';
    return;
  }

  let html = '<div class="rutas-grid">';
  rutas.forEach(r => {
    const codigo = r.codigo || r.code || '';
    const nombre = r.nombre || r.name || '';
    const descripcion = r.descripcion || r.description || '';
    const empresa = (r.empresa && (r.empresa.nombre || r.empresa.name)) || r.empresa_nombre || r.empresa_id || '';
    const fileName = r.file_name || r.fileName || '';
    const extension = fileName ? fileName.split('.').pop().toUpperCase() : '';
    const created = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';

    html += `<div class="ruta-card">
            <div class="ruta-card-header">
                ${codigo ? `<span class="ruta-code">${codigo}</span>` : ''}
                <span class="ruta-ext ${extension ? '' : 'ruta-ext-empty'}">${extension || 'FILE'}</span>
            </div>
            <h4 class="ruta-name">${nombre || 'Sin Nombre'}</h4>
            ${descripcion ? `<p class="ruta-desc">${descripcion}</p>` : ''}
            <div class="ruta-meta">
                <span><strong>Empresa:</strong> ${empresa || 'No asociada'}</span>
                <span><strong>Creada:</strong> ${created || '—'}</span>
            </div>
            <div class="ruta-actions">
                <div class="ruta-actions-row">
                    ${window.canUpdate('rutas') ? `
                    <button class="ruta-btn ruta-btn--edit" aria-label="Editar ruta" data-id="${r.id}" data-action="edit" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" />
                            <path d="M13.5 6.5l4 4" />
                        </svg>
                        Editar
                    </button>
                    ` : ''}
                    ${window.canDelete('rutas') ? `
                    <button class="ruta-btn ruta-btn--delete" aria-label="Eliminar ruta" data-id="${r.id}" data-action="delete" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 7h12" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                            <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                        </svg>
                        Eliminar
                    </button>
                    ` : ''}
                </div>
                ${fileName ? `<button class="ruta-btn ruta-btn--download" aria-label="Descargar ruta" data-id="${r.id}" data-action="download" title="Descargar archivo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 17.5C4 16.672 4.672 16 5.5 16h13c.828 0 1.5.672 1.5 1.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5Z" />
                        <path d="M12 3v11" />
                        <path d="M8 10.5l4 3.5 4-3.5" />
                    </svg>
                    Descargar
                </button>` : ''}
            </div>
        </div>`;
  });
  html += '</div>';
  container.innerHTML = html;

  // Delegar acciones de descarga/eliminación
  container.querySelectorAll('.ruta-actions button').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const action = e.currentTarget.getAttribute('data-action');
      if (action === 'delete') {
        deleteRuta(parseInt(id, 10));
      } else if (action === 'download') {
        downloadRuta(id);
      } else if (action === 'edit') {
        openEditRuta(id);
      }
    });
  });
}

// Descargar archivo de ruta usando fetch con Authorization
async function downloadRuta(id) {
  try {
    const csrfToken = getCookie('XSRF-TOKEN');
    const resp = await fetch(`/api/rutas/${id}/file`, {
      headers: csrfToken ? {
        'X-XSRF-TOKEN': csrfToken
      } : {},
      credentials: 'same-origin'
    });
    if (!resp.ok) {
      showNotification('error', 'Descarga falló', 'Servidor retornó error');
      return;
    }
    const blob = await resp.blob();
    // Intentar obtener nombre del header Content-Disposition
    let fileName = 'ruta';
    const cd = resp.headers.get('Content-Disposition');
    if (cd) {
      const match = cd.match(/filename="?([^";]+)"?/);
      if (match) fileName = match[1];
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    showNotification('error', 'Descarga falló', 'No se pudo descargar el archivo');
  }
}

// Abrir modal en modo edición
async function openEditRuta(id) {
  try {
    const dataResp = await apiGet(`/rutas/${id}`);
    const ruta = dataResp?.data || dataResp; // según formato de apiGet
    if (!ruta) {
      showNotification('error', 'No encontrada', 'No se pudo cargar la ruta');
      return;
    }
    openModalRuta(); // inicializa
    document.getElementById('ruta-edit-id').value = id;
    document.getElementById('ruta-nombre').value = ruta.name || ruta.nombre || '';
    document.getElementById('ruta-modal-title').textContent = 'Editar Ruta';
    document.getElementById('ruta-submit-btn').textContent = 'Actualizar';
    const currentFileEl = document.getElementById('ruta-current-file');
    currentFileEl.style.display = 'block';
    currentFileEl.textContent = `Archivo actual: ${(ruta.file_name || '').split('/').pop()}`;
    document.getElementById('ruta-file-help').textContent = 'Seleccione el nuevo archivo (obligatorio para actualizar).';
  } catch (err) {
    showNotification('error', 'Error', 'No se pudo abrir la edición');
  }
}

// Eliminar ruta
window.deleteRuta = async function (id) {
  showConfirm(
    'Eliminar Ruta'
    , '¿Estás seguro que deseas eliminar esta ruta?'
    , async () => {
      const result = await apiDelete(`/rutas/${id}`);
      if (result) {
        showNotification('success', '¡Éxito!', 'Ruta eliminada');
        loadRutas();
      }
    }
  );
};

// Abrir modal para agregar ruta
function openModalRuta() {
  const form = document.getElementById('form-ruta');
  form.reset();

  // INYECCIÓN AUTOMÁTICA DE EMPRESA
  const hiddenEmpresa = document.getElementById('ruta-empresa-id');
  if (hiddenEmpresa) {
    if (window.myEmpresaId) {
      hiddenEmpresa.value = window.myEmpresaId;
    } else {
      console.error("No hay ID de empresa para asignar a la ruta.");
    }
  }

  document.getElementById('ruta-edit-id').value = '';
  document.getElementById('ruta-modal-title').textContent = 'Agregar Ruta';
  document.getElementById('ruta-submit-btn').textContent = 'Guardar';
  document.getElementById('ruta-current-file').style.display = 'none';
  document.getElementById('modal-ruta').style.display = 'flex';
}

// Guardar ruta
async function saveRuta(e) {
  e.preventDefault();
  const nombre = document.getElementById('ruta-nombre').value.trim();
  const fileInput = document.getElementById('ruta-file');
  const editId = document.getElementById('ruta-edit-id').value;

  const empresaId = window.myEmpresaId || document.getElementById('ruta-empresa-id').value;

  if (!nombre) return showNotification('warning', 'Requerido', 'Nombre de ruta obligatorio.');
  if (!editId && (!fileInput || fileInput.files.length === 0)) return showNotification('warning', 'Requerido', 'Archivo obligatorio.');
  if (!empresaId) return showNotification('error', 'Error', 'No se identificó la empresa.');

  const formData = new FormData();
  formData.append('name', nombre);
  formData.append('empresa_id', empresaId);
  if (fileInput.files[0]) formData.append('file', fileInput.files[0]);

  const btnSubmit = e.target.querySelector('button[type="submit"]') || document.getElementById('ruta-submit-btn');
  if (btnSubmit && btnSubmit.disabled) return;
  if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

  try {
    let result;
    if (editId) {
      result = await apiPostFile(`/rutas/${editId}`, formData);
    } else {
      result = await apiPostFile('/rutas', formData);
    }

    if (result && result.status !== false) {
      showNotification('success', 'Éxito', 'Ruta guardada.');
      document.getElementById('modal-ruta').style.display = 'none';
      loadRutas();
    } else {
      showNotification('error', 'Error', 'No se pudo guardar.');
    }
  } finally {
    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
  }
}

// Exponer al scope global
window.loadRutas = loadRutas;
window.downloadRuta = downloadRuta;
window.openEditRuta = openEditRuta;
window.openModalRuta = openModalRuta;
window.saveRuta = saveRuta;