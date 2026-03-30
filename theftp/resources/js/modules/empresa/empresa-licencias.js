// ==========================
// 3. GESTIÓN DE LICENCIAS
// ==========================
async function loadLicencias() {
  // Cargar licencias con sus relaciones principales
  const response = await apiGet('/conductores-licencias?include=conductor.persona,licencia.categoria,licencia.documento');
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

  // (Eliminado el bucle de carga individual de documentos para mejorar rendimiento y evitar 404s)

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

      // Estado y Semaforización (VIGENTE, POR VENCER, VENCIDA, INACTIVA)
      let estadoColor = '#10b981'; // Verde por defecto
      let estadoTexto = 'VIGENTE';
      
      const fechaVencStr = licObj.fecha_vencimiento || l.fecha_vencimiento || null;
      if (licObj.estado === false || licObj.estado === 0 || String(licObj.estado) === '0') {
          estadoColor = '#ef4444'; // Rojo (Inactiva)
          estadoTexto = 'INACTIVA';
      } else if (fechaVencStr) {
        const hoy = new Date();
        const venc = new Date(fechaVencStr);
        const diffTime = venc - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          estadoColor = '#ef4444'; // Rojo (Vencida)
          estadoTexto = 'VENCIDA';
        } else if (diffDays <= 30) {
          estadoColor = '#f59e0b'; // Amarillo (Por vencer)
          estadoTexto = `VENCE EN ${diffDays} DÍAS`;
        }
      }

      html += `
                <div class="licencia-card" data-licencia-id="${l.id}">
                    <div class="licencia-card-header">
                        <div class="licencia-avatar" data-tooltip="${nombreCompleto}">
                            ${iniciales}
                        </div>
                        <div class="licencia-card-title">
                            <h4 data-tooltip="${nombreCompleto}">${nombreCompleto}</h4>
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
                        <div class="licencia-info-row">
                            <span class="info-label">Expedición:</span>
                            <span class="info-value">${licObj.fecha_expedicion || '—'}</span>
                        </div>
                        <div class="licencia-info-row">
                            <span class="info-label">Vencimiento:</span>
                            <span class="info-value" style="font-weight:bold; color:${estadoTexto === 'VIGENTE' ? 'inherit' : estadoColor}">${licObj.fecha_vencimiento || '—'}</span>
                        </div>
                        <div class="licencia-info-row">
                            <span class="info-label">Organismo:</span>
                            <span class="info-value text-sm">${licObj.organismo_transito || '—'}</span>
                        </div>
                    </div>

                    <div class="licencia-card-footer">
                        <div style="display:flex; gap:0.5rem; width:100%;">
                            ${window.canUpdate('conductores_licencias') ? `
                            <button class="btn-edit" onclick="editLicencia(${l.id})" title="Editar" style="flex:1;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:16px; height:16px;">
                                    <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M13.5 6.5l4 4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Editar
                            </button>
                            ` : ''}
                            ${window.canDelete('conductores_licencias') ? `
                            <button class="btn-delete" onclick="deleteLicencia(${l.id})" title="Eliminar" style="flex:1;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px;">
                                    <path d="M6 7h12" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                                    <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                                </svg>
                                Eliminar
                            </button>
                            ` : ''}
                            ${window.canUpdate('conductores_licencias') ? `
                            <button class="btn-violet btn-historial-licencia" onclick="openModalNovedadesLicencia(${licObj.id})" title="Historial de Novedades" style="flex: 1;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:16px; height:16px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Novedades
                            </button>
                            ` : ''}
                        </div>
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
  window.licenciaEditingId = null;
  document.getElementById('licencia-edit-id').value = '';
  document.getElementById('form-licencia').reset();
  document.getElementById('licencia-modal-title').textContent = 'Asignar Licencia a Conductor';
  document.getElementById('licencia-conductor').disabled = false;
  
  if (document.getElementById('licencia-timestamps')) {
      document.getElementById('licencia-timestamps').style.display = 'none';
  }
  
  // Ajustar labels para archivo
  document.getElementById('label-archivo-licencia').textContent = 'Documento de Licencia (Obligatorio)';
  document.getElementById('licencia-archivo').required = true;

  // Cargar conductores (Asegurarse de cargar TODOS con limit=3000 máximo permitido para que aplique el mapa de edades)
  const conductores = await apiGet('/conductores?include=persona&limit=3000');
  const selectCond = document.getElementById('licencia-conductor');
  selectCond.innerHTML = '<option value="">Seleccione Conductor</option>';

  const conductoresData = normalizeList(conductores);
  window.conductorInfoMap = {}; // para autocompletar NUI, edad y validaciones strictas
  conductoresData.forEach(c => {
    const persona = c.persona || {};
    const label = `${persona.name || ''} ${persona.last_name || ''}`.trim() || `Conductor #${c.id}`;
    if (label) {
      selectCond.innerHTML += `<option value="${c.id}">${label}</option>`;
      window.conductorInfoMap[c.id] = {
        nui: persona.nui,
        birth_date: persona.birth_date
      };
    }
  });

// Función para sugerir fecha de vencimiento según Ley Colombiana
  const updateVencimientoSugerido = () => {
    const cid = selectCond.value;
    const catId = document.getElementById('licencia-categoria').value;
    const fechaExp = document.getElementById('licencia-fecha-expedicion').value;
    const inputVenc = document.getElementById('licencia-fecha-vencimiento');

    if (!cid) return;

    const info = window.conductorInfoMap[cid];
    if (!info || !info.birth_date) return;

    // Establecer fecha mínima manejable de expedición (Conductor + 18 años)
    const birth = new Date(info.birth_date);
    const dateMinExpedicion = new Date(birth);
    dateMinExpedicion.setFullYear(dateMinExpedicion.getFullYear() + 18);
    const fechaExpInput = document.getElementById('licencia-fecha-expedicion');
    fechaExpInput.min = dateMinExpedicion.toISOString().split('T')[0];

    if (!catId || !fechaExp) return;

    // Calcular edad
    const exp = new Date(fechaExp);
    let age = exp.getFullYear() - birth.getFullYear();
    const m = exp.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && exp.getDate() < birth.getDate())) age--;

    // Identificar tipo de categoría (Público/Carga vs Particular)
    const catOption = document.getElementById('licencia-categoria').options[document.getElementById('licencia-categoria').selectedIndex];
    const catText = catOption.text.toLowerCase();
    
    let planesVigencia = 0;

    if (catText.includes('público') || catText.includes('carga') || catText.includes('c1') || catText.includes('c2') || catText.includes('c3')) {
      // Servicio Público (C1, C2, C3)
      planesVigencia = (age < 60) ? 3 : 1;
    } else {
      // Particular (A1, A2, B1, B2, B3)
      if (age < 60) planesVigencia = 10;
      else if (age < 80) planesVigencia = 5;
      else planesVigencia = 1;
    }

    const nuevaVenc = new Date(exp);
    nuevaVenc.setFullYear(nuevaVenc.getFullYear() + planesVigencia);
    inputVenc.value = nuevaVenc.toISOString().split('T')[0];
    
    // Notificar al usuario del cálculo automático
    console.log(`Vigencia sugerida para edad ${age}: +${planesVigencia} años.`);
  };

  // Listeners para autocompletado y cálculos
  selectCond.onchange = () => {
    const cid = selectCond.value;
    if (cid && window.conductorInfoMap[cid]) {
      document.getElementById('licencia-numero').value = window.conductorInfoMap[cid].nui || '';
    }
    updateVencimientoSugerido();
  };

  document.getElementById('licencia-categoria').onchange = updateVencimientoSugerido;
  document.getElementById('licencia-fecha-expedicion').onchange = updateVencimientoSugerido;

  // Cargar categorías con códigos descriptivos (Filtradas a solo Servicio Público C1/C2)
  const categorias = await apiGet('/categorias_licencia');
  const selectCat = document.getElementById('licencia-categoria');
  selectCat.innerHTML = '<option value="">Seleccione Categoría</option>';

  const categoriasAdmitidas = normalizeList(categorias).filter(cat => {
      const desc = cat.descripcion.toLowerCase();
      // En Colombia, C1, C2 (Servicio Público) corresponden a licencias de servicio público.
      return desc.includes('público') || desc.includes('publico') || desc.includes('c1') || desc.includes('c2');
  });

  categoriasAdmitidas.forEach(cat => {
    let label = cat.descripcion;
    // Agregar códigos sugeridos si no los tiene en la base de datos
    if (label.toLowerCase().includes('público') && !label.includes('C1')) {
         label = `(C1 / C2) ${label}`;
    }
    selectCat.innerHTML += `<option value="${cat.id}">${label}</option>`;
  });

  // Cargar restricciones
  const restricciones = await apiGet('/restricciones-licencia');
  const selectRest = document.getElementById('licencia-restriccion');
  selectRest.innerHTML = '<option value="">Seleccione Restricción</option>';

  normalizeList(restricciones).forEach(r => {
    // Solo mostrar las habilitadas por defecto en el selector de creación
    if (r.estado === true || r.estado === 1 || String(r.estado) === '1') {
      selectRest.innerHTML += `<option value="${r.id}">${r.descripcion}</option>`;
    }
  });

  document.getElementById('modal-licencia').style.display = 'flex';
}

// Editar Licencia
window.editLicencia = async function(id) {
  // Buscar la asignación en la lista actual o cargarla
  const resp = await apiGet(`/conductores-licencias/${id}?include=licencia.categoria,conductor.persona`);
  const data = resp?.data;
  if (!data || !data.licencia) return;

  await openModalLicencia(); // Cargar catálogos
  
  window.licenciaEditingId = id;
  document.getElementById('licencia-edit-id').value = id;
  document.getElementById('licencia-modal-title').textContent = 'Editar Licencia';
  
  // Los conductores no se cambian al editar la asignación de licencia (regla de integridad)
  document.getElementById('licencia-conductor').value = data.conductor_id;
  document.getElementById('licencia-conductor').disabled = true;

  const lic = data.licencia;

  document.getElementById('licencia-categoria').value = lic.categoria_lic_id || lic.categoria?.id || '';
  document.getElementById('licencia-restriccion').value = lic.restriccion_lic_id || '';
  document.getElementById('licencia-numero').value = lic.numero || '';
  document.getElementById('licencia-fecha-expedicion').value = lic.fecha_expedicion || '';
  document.getElementById('licencia-fecha-vencimiento').value = lic.fecha_vencimiento || '';
  document.getElementById('licencia-organismo').value = lic.organismo_transito || '';
  
  // Mostrar huellas de auditoría en UI
  document.getElementById('licencia-timestamps').style.display = 'block';
  document.getElementById('licencia-created-at').textContent = `Registro Oficial Creado: ${lic.created_at || 'Desconocido'}`;
  document.getElementById('licencia-updated-at').textContent = `Última Edición Realizada: ${lic.updated_at || 'Desconocido'}`;

  // Archivo opcional al editar
  document.getElementById('label-archivo-licencia').textContent = 'Subir nuevo documento (Opcional)';
  document.getElementById('licencia-archivo').required = false;

  // Auto-corregir cualquier fecha corrupta almacenada obligando al recalculador a correr
  const expEvent = new Event('change');
  document.getElementById('licencia-fecha-expedicion').dispatchEvent(expEvent);

  // Actualizar los atributos max y min inmediatamente para edición
  if (window.conductorInfoMap && window.conductorInfoMap[data.conductor_id]) {
      const bDate = window.conductorInfoMap[data.conductor_id].birth_date;
      if (bDate) {
          const birthD = new Date(bDate);
          birthD.setFullYear(birthD.getFullYear() + 18);
          document.getElementById('licencia-fecha-expedicion').min = birthD.toISOString().split('T')[0];
      }
  }

  document.getElementById('modal-licencia').style.display = 'flex';
};

// Guardar licencia (3 pasos: documento → licencia → asignación conductor)
async function saveLicencia(e) {
  e.preventDefault();
  
  const form = document.getElementById('form-licencia');
  if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
  }

  const conductorId = document.getElementById('licencia-conductor').value;
  const categoriaId = document.getElementById('licencia-categoria').value;
  const restriccionId = document.getElementById('licencia-restriccion').value;
  const numero = document.getElementById('licencia-numero').value;
  const fechaExpedicion = document.getElementById('licencia-fecha-expedicion').value;
  const fechaVencimiento = document.getElementById('licencia-fecha-vencimiento').value;
  const organismo = document.getElementById('licencia-organismo').value;
  const archivo = document.getElementById('licencia-archivo').files[0];

  if (!conductorId || !categoriaId || !numero || (!window.licenciaEditingId && !archivo) || !fechaExpedicion || !fechaVencimiento || !organismo) {
    showNotification('warning', 'Campos incompletos', 'Por favor complete todos los campos requeridos.');
    return;
  }

  const expDateObj = new Date(fechaExpedicion);
  if (expDateObj > new Date()) {
      showNotification('error', 'Fecha Inválida', 'La fecha de expedición no puede estar en el futuro.');
      return;
  }
  
  // Validar mayoría de edad en la fecha de expedición
  if (window.conductorInfoMap && window.conductorInfoMap[conductorId]) {
      const birthDate = window.conductorInfoMap[conductorId].birth_date;
      if (birthDate && fechaExpedicion) {
          const birth = new Date(birthDate);
          let ageAtExp = expDateObj.getFullYear() - birth.getFullYear();
          const m = expDateObj.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && expDateObj.getDate() < birth.getDate())) ageAtExp--;
          
          if (ageAtExp < 18) {
              showNotification('error', 'Fecha de Expedición Inválida', `En la fecha de expedición (${fechaExpedicion}), el conductor tenía ${ageAtExp} años. Para tener licencia oficial debe haberla sacado siendo mayor de 18 años.`);
              return;
          }
      }
  }

  // Validación de Categoría Profesional (C1, C2, C3 o IDs 2/3)
  const selectCat = document.getElementById('licencia-categoria');
  const catId = selectCat.value;
  const catText = selectCat.options[selectCat.selectedIndex].text.toUpperCase();
  
  // ID 2 es Servicio Público y ID 3 es Carga (Profesionales en esta DB)
  const esProfesional = catId == '2' || catId == '3' || catText.includes('C1') || catText.includes('C2') || catText.includes('C3');

  if (!esProfesional) {
    showNotification('error', 'Categoría No Válida', 'Para transporte público colectivo solo se permiten categorías profesionales (Servicio Público o Carga).');
    return;
  }

  // Validación de Fecha de Vencimiento
  if (new Date(fechaVencimiento) <= new Date()) {
    showNotification('error', 'Licencia Vencida', 'No se puede registrar una licencia que ya está vencida.');
    return;
  }

  // --- VALIDACIÓN DE DUPLICADOS (Solo en creación) ---
  if (!window.licenciaEditingId) {
    try {
      const filterDup = JSON.stringify([{ column: 'conductor_id', operator: '=', value: conductorId }]);
      const dupResp = await apiGet(`/conductores-licencias?filter=${encodeURIComponent(filterDup)}`);
      if (normalizeList(dupResp).length > 0) {
        showNotification('error', 'Registro Duplicado', 'Este conductor ya tiene una licencia asignada. Si deseas cambiarla, edita la existente.');
        return;
      }
    } catch (e) { console.debug('Error validando duplicados', e); }
  }

  // Anti doble-submit
  const btnSubmit = e.target.querySelector('button[type="submit"]');
  if (btnSubmit && btnSubmit.disabled) return;
  if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

  try {
    let documentoId = null;
    
    // Paso 1: Crear o actualizar el documento (solo si hay archivo nuevo)
    if (archivo) {
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('observaciones', `Licencia #${numero} - Conductor ID: ${conductorId}`);
      formData.append('tipo_doc_id', 1);

      const documentoResult = await apiPostFile('/documentos', formData);
      if (documentoResult && documentoResult.data) {
        documentoId = documentoResult.data.id;
      }
    }

    // El estado de la licencia ahora se gestiona exclusivamente por el Modal de Novedades (Historial)
    // Para nuevas licencias el estado por defecto del servidor es true (Activo)
    
    // Paso 2: Crear o Actualizar la licencia
    const licenciaData = {
      numero: numero,
      categoria_lic_id: categoriaId,
      restriccion_lic_id: restriccionId || 1, 
      fecha_expedicion: fechaExpedicion,
      fecha_vencimiento: fechaVencimiento,
      organismo_transito: organismo
    };
    if (documentoId) licenciaData.documento_id = documentoId;

    let targetLicenciaId = null;

    if (window.licenciaEditingId) {
      // Obtener el ID de la licencia real desde la asignación
      const currentAsign = await apiGet(`/conductores-licencias/${window.licenciaEditingId}?include=licencia`);
      targetLicenciaId = currentAsign?.data?.licencia_id;
      
      if (targetLicenciaId) {
        // Si no subieron nuevo archivo, debemos enviar el documento_id original para pasar la validación (422)
        if (!licenciaData.documento_id && currentAsign?.data?.licencia?.documento_id) {
            licenciaData.documento_id = currentAsign.data.licencia.documento_id;
        }
        await apiPut(`/licencias/${targetLicenciaId}`, licenciaData);
      }
      showNotification('success', '¡Éxito!', 'Licencia actualizada correctamente.');
    } else {
      // Crear nueva licencia
      const licenciaResult = await apiPost('/licencias', licenciaData);
      if (licenciaResult && licenciaResult.data) {
        targetLicenciaId = licenciaResult.data.id;
        
        // Paso 3: Crear la asignación conductor-licencia
        const asignacionData = {
          conductor_id: conductorId,
          licencia_id: targetLicenciaId
        };
        await apiPost('/conductores-licencias', asignacionData);
        showNotification('success', '¡Éxito!', 'Licencia asignada exitosamente.');
      }
    }

    document.getElementById('modal-licencia').style.display = 'none';
    loadLicencias();

  } catch (error) {
    console.error('Error en saveLicencia:', error);
    showNotification('error', 'Error', 'Ocurrió un error al procesar la licencia: ' + error.message);
  } finally {
    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
  }
}

// Exponer al scope global
window.loadLicencias = loadLicencias;
window.openModalLicencia = openModalLicencia;
window.saveLicencia = saveLicencia;

// ============================================
// NOVEDADES DE LICENCIA (Historial/SoftDeletes)
// ============================================

async function openModalNovedadesLicencia(licenciaId) {
    document.getElementById('novedad-licencia-id').value = licenciaId;
    document.getElementById('form-novedad-licencia').reset();
    document.getElementById('novedad-licencia-id').value = licenciaId; // re-set after reset
    document.getElementById('modal-novedades-licencia').style.display = 'flex';
    await loadNovedadesLicencia(licenciaId);
}

async function loadNovedadesLicencia(licenciaId) {
    const tableDiv = document.getElementById('novedades-licencia-table');
    tableDiv.innerHTML = '<div class="text-center p-4 text-gray-500">Cargando historial...</div>';

    const response = await apiGet(`/novedades-licencias?licencia_id=${licenciaId}`);
    if (!response || !response.data) {
        tableDiv.innerHTML = '<div class="text-center p-4 text-gray-500">Error al cargar historial.</div>';
        return;
    }

    const data = normalizeList(response);
    if (data.length === 0) {
        tableDiv.innerHTML = '<div class="text-center p-4 text-gray-400">Sin historial de sanciones registrado. La licencia está completamente activa.</div>';
        return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">';
    html += '<thead style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;"><tr><th style="padding: 8px;">Motivo</th><th style="padding: 8px;">Inicio</th><th style="padding: 8px;">Fin</th><th style="padding: 8px;">Detalles</th><th style="padding: 8px; text-align: right;">Acciones</th></tr></thead><tbody>';

    data.forEach(n => {
        const isDeleted = n.deleted_at != null;
        const rowStyle = isDeleted ? 'background-color: #f9fafb; color: #9ca3af; border-bottom: 1px solid #e5e7eb;' : 'border-bottom: 1px solid #e5e7eb;';
        const statusBadge = isDeleted 
            ? '<span style="display:inline-block; margin-top:2px; padding: 2px 8px; font-size: 0.7rem; border-radius: 4px; background: #e5e7eb; color: #6b7280;">Histórico</span>' 
            : '<span style="display:inline-block; margin-top:2px; padding: 2px 8px; font-size: 0.7rem; border-radius: 4px; background: #dbeafe; color: #1d4ed8;">Vigente</span>';

        html += `<tr style="${rowStyle}">
            <td style="padding: 8px; font-weight: 600;">
                ${n.tipo_novedad} <br> ${statusBadge}
            </td>
            <td style="padding: 8px;">${n.fecha_inicio}</td>
            <td style="padding: 8px;">${n.fecha_fin || '—'}</td>
            <td style="padding: 8px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${n.observaciones || ''}">${n.observaciones || '—'}</td>
            <td style="padding: 8px; text-align: right;">
                ${!isDeleted ? `
                <button type="button" style="color:#ef4444; border:none; background:transparent; cursor:pointer;" onclick="deleteNovedadLicencia(${n.id}, ${licenciaId})" title="Levantar sanción">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:16px; height:16px; display:inline;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                ` : '<span style="font-size:0.75rem; font-style:italic;">Archivado</span>'}
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

async function saveNovedadLicencia(e) {
    e.preventDefault();
    const licenciaId = document.getElementById('novedad-licencia-id').value;
    let tipoNovedad = document.getElementById('novedad-licencia-tipo').value;
    
    if (tipoNovedad === 'Otra Razón') {
        const otraVal = document.getElementById('novedad-licencia-otra').value.trim();
        if (!otraVal) { showNotification('error', 'Error', 'Especifique la razón.'); return; }
        tipoNovedad = otraVal;
    }

    const payload = {
        licencia_id: licenciaId,
        tipo_novedad: tipoNovedad,
        fecha_inicio: document.getElementById('novedad-licencia-inicio').value,
        fecha_fin: document.getElementById('novedad-licencia-fin').value || null,
        observaciones: document.getElementById('novedad-licencia-obs').value || null
    };

    try {
        await apiPost('/novedades-licencias', payload);
        showNotification('success', '¡Sanción Registrada!', 'La licencia ha sido inactivada automáticamente.');
        document.getElementById('form-novedad-licencia').reset();
        document.getElementById('novedad-licencia-id').value = licenciaId;
        await loadNovedadesLicencia(licenciaId);
        loadLicencias(); // Refrescar tarjetas
    } catch (error) {
        console.error('Error registrando novedad licencia:', error);
        showNotification('error', 'Error', 'No se pudo registrar la novedad: ' + error.message);
    }
}

async function deleteNovedadLicencia(novedadId, licenciaId) {
    showConfirm('Levantar Sanción', '¿Deseas archivar esta sanción y reactivar la licencia?', async () => {
        try {
            await apiDelete(`/novedades-licencias/${novedadId}`);
            showNotification('success', '¡Sanción Levantada!', 'La licencia ha sido reactivada y la sanción archivada.');
            await loadNovedadesLicencia(licenciaId);
            loadLicencias();
        } catch (error) {
            console.error('Error archivando novedad licencia:', error);
            showNotification('error', 'Error', 'No se pudo archivar: ' + error.message);
        }
    });
}

window.openModalNovedadesLicencia = openModalNovedadesLicencia;
window.saveNovedadLicencia = saveNovedadLicencia;
window.deleteNovedadLicencia = deleteNovedadLicencia;