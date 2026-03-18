// ==========================
// 3. GESTIÓN DE LICENCIAS
// ==========================
async function loadLicencias() {
  // Cargar licencias
  const response = await apiGet('/conductores-licencias?include=conductor,licencia');
  const licencias = normalizeList(response);

  console.log('=== LOAD LICENCIAS ===');
  console.log('Respuesta cruda:', response);
  console.log('Licencias normalizadas:', licencias);

  // Cargar catálogos auxiliares
  const categoriasResp = await apiGet('/categorias_licencia');
  const restriccionesResp = await apiGet('/restriccion_lic');
  const documentosResp = await apiGet('/documentos');
  const conductoresResp = await apiGet('/conductores?include=persona');

  const categorias = normalizeList(categoriasResp);
  const restricciones = normalizeList(restriccionesResp);
  const documentos = normalizeList(documentosResp);
  const conductoresLista = normalizeList(conductoresResp);

  // Maps rápidos
  const categoriasMap = {};
  const restriccionesMap = {};
  const documentosMap = {};
  const conductorPersonaMap = {};

  categorias.forEach(c => {
    if (c && (c.id || c.categoria_id)) categoriasMap[c.id || c.categoria_id] = c;
  });
  restricciones.forEach(r => {
    if (r && (r.id || r.restriccion_lic_id)) restriccionesMap[r.id || r.restriccion_lic_id] = (r.descripcion || r.nombre || 'Sin restricciones');
  });
  documentos.forEach(d => {
    if (d && (d.id || d.documento_id)) documentosMap[d.id || d.documento_id] = d;
  });
  conductoresLista.forEach(c => {
    if (c && c.persona) conductorPersonaMap[c.id] = c.persona;
  });

  // Helper: resolve category display (prefer nombre/descripcion, not codigo)
  function resolveCategoria(lica, wrapper) {
    const cand = lica?.categoria || lica?.categoria_licencia || lica?.categoriaObj || null;
    if (cand) return cand.nombre || cand.descripcion || cand.codigo || (typeof cand === 'string' ? cand : null);
    const id = lica?.categoria_id || lica?.categoria_lic_id || lica?.categoriaLicId || wrapper?.categoria_id || wrapper?.categoria_lic_id || wrapper?.categoriaId || null;
    if (id && categoriasMap[id]) {
      const c = categoriasMap[id];
      return c.nombre || c.descripcion || c.codigo || String(id);
    }
    // try nested licencia
    const nestedId = (lica && lica.licencia && (lica.licencia.categoria_id || lica.licencia.categoria_lic_id)) || null;
    if (nestedId && categoriasMap[nestedId]) {
      const c = categoriasMap[nestedId];
      return c.nombre || c.descripcion || c.codigo || String(nestedId);
    }
    return null;
  }

  // Helper: resolve documento display (prefer numeric identifier fields)
  function resolveDocumentoText(doc) {
    if (!doc) return null;
    const candidates = [
      'numero', 'nro', 'numero_documento', 'nro_documento', 'numero_registro', 'numeroDocumento', 'nroDocumento', 'nui', 'numero_identificacion', 'identificacion'
    ];
    for (const k of candidates) {
      if (doc[k]) return String(doc[k]);
    }
    // fallback to nombre/descripcion/titulo
    return doc.nombre || doc.descripcion || doc.titulo || null;
  }

  // Si no hay licencias, mostrar mensaje simple
  if (!licencias || licencias.length === 0) {
    document.getElementById('licencias-table').innerHTML = `
            <div style="text-align:center; padding:2rem; color:#6b7280;">
                <p style="font-size:1.1rem; font-weight:500;">No hay asignaciones de licencias</p>
                <p style="font-size:0.9rem; margin-top:0.5rem;">Asigna licencias a conductores para verlas aquí</p>
            </div>
        `;
    return;
  }

  // Detectar documentos faltantes referenciados por licencias y cargarlos individualmente
  const missingDocIds = [];
  licencias.forEach(item => {
    const licObj = item.licencia || item;
    const docId = licObj && (licObj.documento_id || licObj.documentoId || licObj.documento);
    if (docId && !documentosMap[docId]) missingDocIds.push(docId);
  });
  const uniqueMissing = [...new Set(missingDocIds)];
  for (const id of uniqueMissing) {
    try {
      const r = await apiGet(`/documentos/${id}`);
      if (r && r.data) documentosMap[id] = r.data;
    } catch (e) {
      console.warn('Error cargando documento ID', id, e);
    }
  }

  let html = '<div class="licencias-grid">';

  licencias.forEach((l, index) => {
    try {
      // Nombre del conductor
      let nombreCompleto = 'Conductor';
      let iniciales = 'NA';
      if (l.conductor) {
        let persona = l.conductor.persona || conductorPersonaMap[l.conductor.id];
        if (persona) {
          const firstName = (persona.name || persona.nombres || '').trim();
          const lastName = (persona.last_name || persona.apellidos || '').trim();
          nombreCompleto = `${firstName} ${lastName}`.trim() || 'Conductor';
          const fnInitial = firstName ? firstName.split(/\s+/)[0].charAt(0) : 'N';
          const lnInitial = lastName ? lastName.split(/\s+/).slice(-1)[0].charAt(0) : 'A';
          iniciales = `${fnInitial}${lnInitial}`.toUpperCase();
        }
      }

      // Datos de la licencia
      const licObj = l.licencia || l;
      const numero = licObj.numero || licObj.numero_licencia || licObj.licencia_num || licObj.id || 'N/A';

      // Categoría
      let categoria = '—';
      const resolvedCat = resolveCategoria(licObj, l);
      if (resolvedCat) categoria = resolvedCat;

      // Debug: show what we found for category/document per licencia (print first 6)
      if (index < 6) console.debug('DEBUG licencia sample', {
        index
        , licObj
        , resolvedCat
        , categoria
      });

      // Restricción
      let restriccion = 'Sin restricciones';
      const restrId = licObj.restriccion_lic_id || licObj.restriccion_id || l.restriccion_lic_id || l.restriccion_id;
      if (restrId && restriccionesMap[restrId]) restriccion = restriccionesMap[restrId];

      // Documento - Número de identificación de la persona (NUI)
      let documentoText = '';

      // Primero intentamos obtener el NUI de la persona del conductor
      if (l.conductor) {
        let persona = l.conductor.persona || conductorPersonaMap[l.conductor.id];
        if (persona && persona.nui) {
          documentoText = String(persona.nui);
        }
      }

      // Si no encontramos el NUI, buscamos en el documento de la licencia
      if (!documentoText) {
        const rawDocRef = licObj.documento_id || licObj.documentoId || licObj.documento || l.documento_id || l.documento || null;
        let docEntry = null;
        if (rawDocRef && typeof rawDocRef === 'object') {
          // licencia.documento might already be an object
          docEntry = rawDocRef;
        } else if (rawDocRef) {
          // try by id or nested id
          const possibleId = (rawDocRef && rawDocRef.id) ? rawDocRef.id : rawDocRef;
          docEntry = documentosMap[possibleId] || documentosMap[rawDocRef] || null;
        }
        if (index < 6) console.debug('DEBUG documento lookup', {
          index
          , rawDocRef
          , docEntryFound: !!docEntry
          , docEntry
        });
        if (docEntry) {
          documentoText = resolveDocumentoText(docEntry) || '';
        }
      }

      // Fecha de expedición (si existe)
      const fechaExp = licObj.fecha_expedicion || licObj.fecha_exped || licObj.expedicion || l.fecha_expedicion || l.fecha_exped || null;

      // Estado (vencimiento simple: si existe fecha vencimiento compararla)
      let estadoColor = '#10b981';
      let estadoTexto = 'VIGENTE';
      // (no cambiar estado si no hay fecha de vencimiento)

      html += `
                <div class="licencia-card" data-licencia-id="${l.id}">
                    <div class="licencia-card-header">
                        <div class="licencia-avatar">
                            ${iniciales}
                        </div>
                        <div class="licencia-card-title">
                            <h4>${nombreCompleto}</h4>
                            <span class="licencia-badge">Licencia #${numero}</span>
                        </div>
                        <div class="licencia-estado" style="background: ${estadoColor};">
                            ${estadoTexto}
                        </div>
                    </div>

                    <div class="licencia-card-body">
                        <div class="licencia-info-row">
                            <span class="info-label">Categoría:</span>
                            <span class="info-value">${categoria}</span>
                        </div>
                        <div class="licencia-info-row">
                            <span class="info-label">Restricción:</span>
                            <span class="info-value">${restriccion}</span>
                        </div>
                        <div class="licencia-info-row">
                            <span class="info-label">Documento:</span>
                            <span class="info-value">${documentoText || '—'}</span>
                        </div>
                        ${fechaExp ? `<div class="licencia-info-row"><span class="info-label">Fecha Expedición:</span><span class="info-value">${fechaExp}</span></div>` : ''}
                    </div>

                    <div class="licencia-card-footer">
                        <button class="btn-delete btn-sm" onclick="deleteLicencia(${l.id})" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;">
                                <path d="M6 7h12" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                                <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
    } catch (error) {
      console.error(`Error procesando licencia ${index}:`, error, l);
    }
  });

  html += '</div>';
  document.getElementById('licencias-table').innerHTML = html;
}

// Eliminar asignación de licencia
window.deleteLicencia = async function (id) {
  showConfirm(
    'Eliminar Asignación'
    , '¿Estás seguro que deseas eliminar esta asignación de licencia?'
    , async () => {
      const result = await apiDelete(`/conductores-licencias/${id}`);
      if (result) {
        showNotification('success', '¡Éxito!', 'Asignación eliminada');
        loadLicencias();
      }
    }
  );
};

// Abrir modal para asignar licencia
async function openModalLicencia() {
  document.getElementById('form-licencia').reset();

  // Cargar conductores con incluye persona
  const conductores = await apiGet('/conductores?include=persona');
  const selectCond = document.getElementById('licencia-conductor');
  selectCond.innerHTML = '<option value="">Seleccione</option>';

  const conductoresData = normalizeList(conductores);
  conductoresData.forEach(c => {
    const persona = c.persona || {};
    const nombre = persona.name || '';
    const apellido = persona.last_name || '';
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    if (nombreCompleto) {
      selectCond.innerHTML += `<option value="${c.id}">${nombreCompleto}</option>`;
    }
  });

  // Cargar categorías
  const categorias = await apiGet('/categorias_licencia');
  const selectCat = document.getElementById('licencia-categoria');
  selectCat.innerHTML = '<option value="">Seleccione</option>';

  const categoriasData = normalizeList(categorias);
  categoriasData.forEach(cat => {
    selectCat.innerHTML += `<option value="${cat.id}">${cat.descripcion}</option>`;
  });

  // Cargar restricciones
  const restricciones = await apiGet('/restriccion_lic');
  const selectRest = document.getElementById('licencia-restriccion');
  selectRest.innerHTML = '<option value="">Seleccione</option>';

  const restriccionesData = normalizeList(restricciones);
  restriccionesData.forEach(r => {
    selectRest.innerHTML += `<option value="${r.id}">${r.descripcion}</option>`;
  });

  document.getElementById('modal-licencia').style.display = 'flex';
}

// Guardar licencia (3 pasos: documento → licencia → asignación conductor)
async function saveLicencia(e) {
  e.preventDefault();

  const conductorId = document.getElementById('licencia-conductor').value;
  const categoriaId = document.getElementById('licencia-categoria').value;
  const restriccionId = document.getElementById('licencia-restriccion').value;
  const numero = document.getElementById('licencia-numero').value;
  const archivo = document.getElementById('licencia-archivo').files[0];

  if (!conductorId || !categoriaId || !restriccionId || !numero || !archivo) {
    showNotification('warning', 'Campos incompletos', 'Por favor complete todos los campos requeridos, incluyendo el archivo de licencia.');
    return;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (archivo.size > maxSize) {
    showNotification('error', 'Archivo muy grande', 'El archivo no debe superar 10MB.');
    return;
  }

  try {
    // Paso 1: Crear el documento
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('observaciones', `Licencia #${numero} - Conductor ID: ${conductorId}`);
    formData.append('tipo_doc_id', 1);

    const documentoResult = await apiPostFile('/documentos', formData);
    if (!documentoResult || !documentoResult.data) {
      showNotification('error', 'Error al crear documento', 'No se pudo guardar el archivo de licencia.');
      return;
    }
    const documentoId = documentoResult.data.id;

    // Paso 2: Crear la licencia
    const licenciaData = {
      numero: numero
      , categoria_lic_id: categoriaId
      , restriccion_lic_id: restriccionId
      , documento_id: documentoId
    };

    const licenciaResult = await apiPost('/licencias', licenciaData);
    if (!licenciaResult || !licenciaResult.data) {
      showNotification('error', 'Error al crear licencia', 'No se pudo crear la licencia.');
      return;
    }
    const licenciaId = licenciaResult.data.id;

    // Paso 3: Crear la asignación conductor-licencia
    const asignacionData = {
      conductor_id: conductorId
      , licencia_id: licenciaId
    };

    const asignacionResult = await apiPost('/conductores-licencias', asignacionData);
    if (!asignacionResult) {
      showNotification('error', 'Error al asignar', 'No se pudo asignar la licencia al conductor.');
      return;
    }

    showNotification('success', '¡Éxito!', 'Licencia asignada exitosamente al conductor.');
    document.getElementById('modal-licencia').style.display = 'none';
    loadLicencias();

  } catch (error) {
    console.error('Error en saveLicencia:', error);
    showNotification('error', 'Error', 'Ocurrió un error al asignar la licencia: ' + error.message);
  }
}

// Exponer al scope global
window.loadLicencias = loadLicencias;
window.openModalLicencia = openModalLicencia;
window.saveLicencia = saveLicencia;