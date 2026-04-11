// ==========================
// 2. GESTIÓN DE CONDUCTORES
// ==========================
async function loadConductores() {
  const response = await apiGet('/conductores?include=persona,persona.tipo_ident&limit=3000');
  const conductores = normalizeList(response);

  // Cargar licencias para mostrar estado
  const licenciasResp = await apiGet('/conductores-licencias?include=licencia.categoria');
  const licenciasList = normalizeList(licenciasResp);

  // Mapear licencia por id de conductor
  const conductorLicenciaMap = {};
  licenciasList.forEach(l => {
    if (l.conductor_id) conductorLicenciaMap[l.conductor_id] = l.licencia;
  });

  if (conductores.length === 0) {
    document.getElementById('conductores-table').innerHTML = '';
    return;
  }

  let html = '<div class="conductores-grid">';
  conductores.forEach((c, index) => {
    // Obtener datos de forma segura
    const nui = getSafeData(c, 'persona.nui');
    const nombre = getSafeData(c, 'persona.name', '?');
    const apellido = getSafeData(c, 'persona.last_name', '');
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    const telefono = getSafeData(c, 'persona.phone_number');
    const genero = getSafeData(c, 'persona.gender');
    const tipoIdentDesc = getSafeData(c, 'persona.tipo_ident.descripcion', 'CÉDULA');
    const nacimiento = getSafeData(c, 'persona.birth_date', 'N/A');

    (`Conductor ${index}: NUI=${nui}, Nombre=${nombreCompleto}, Telefono=${telefono}, Genero=${genero}, TipoIdent=${tipoIdentDesc}`);

    const generoDisplay = genero === 'Hombre' 
      ? `<div style="display:flex;align-items:center;gap:4px;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 11a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0"/></svg> Hombre</div>` 
      : genero === 'Mujer' 
        ? `<div style="display:flex;align-items:center;gap:4px;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 11a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0M12 12v9m-3-3h6"/></svg> Mujer</div>` 
        : 'N/A';

    html += `
            <div class="conductor-card" data-conductor-id="${c.id}">
                <div class="conductor-card-header">
                    <div class="conductor-avatar">
                        ${iniciales}
                    </div>
                    <div class="conductor-card-title">
                        <h4 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            ${nombreCompleto}
                            ${(c.estado === false || c.estado === 0 || String(c.estado) === '0') ? `<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">INACTIVO</span>` : ''}
                        </h4>
                        <span class="conductor-badge">${tipoIdentDesc}</span>
                    </div>
                </div>

                <div class="conductor-card-body">
                    <div class="conductor-info-row">
                        <span class="info-label">Identificación:</span>
                        <span class="info-value">${nui}</span>
                    </div>
                    <div class="conductor-info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">${telefono}</span>
                    </div>
                    <div class="conductor-info-row">
                        <span class="info-label">Género:</span>
                        <span class="info-value">${generoDisplay}</span>
                    </div>
                    <div class="conductor-info-row">
                        <span class="info-label">Nacimiento:</span>
                        <span class="info-value">${nacimiento}</span>
                    </div>
                    <div class="conductor-info-row">
                        <span class="info-label">Licencia:</span>
                        <span class="info-value">
                            ${(() => {
        const lic = conductorLicenciaMap[c.id];
        if (!lic) return '<span style="color:#6b7280; font-weight:600;">SIN LICENCIA</span>';
        const cat = lic.categoria?.descripcion || lic.categoria || '—';
        return `<span style="color:#10b981; font-weight:600;">VIGENTE (${cat})</span>`;
      })()}
                        </span>
                    </div>
                </div>

                <div class="conductor-card-footer">
                    ${window.canUpdate('conductores') ? `
                    <button class="btn-edit btn-edit-conductor" data-conductor-id="${c.id}" title="Editar" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:16px; height:16px;">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13.5 6.5l4 4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-violet btn-historial-conductor" data-conductor-id="${c.id}" title="Gestión de Novedades" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Novedades
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
  });
  html += '</div>';

  document.getElementById('conductores-table').innerHTML = html;
}

// Función para validar número de identificación según su tipo
function validateIdentificationNumber(tipoIdent, nui) {
  // Remover espacios y caracteres especiales
  const nuiLimpio = nui.trim();

  if (tipoIdent.toUpperCase().includes('CÉDULA DE CIUDADANÍA')) {
    // Cédula de Ciudadanía: debe ser solo números, entre 8 y 10 dígitos
    if (!/^\d{8,10}$/.test(nuiLimpio)) {
      return 'La Cédula de Ciudadanía debe contener entre 8 y 10 dígitos numéricos.';
    }
  } else if (tipoIdent.toUpperCase().includes('CÉDULA DE EXTRANJERÍA')) {
    // Cédula de Extranjería: debe ser solo números, entre 8 y 10 dígitos
    if (!/^\d{8,10}$/.test(nuiLimpio)) {
      return 'La Cédula de Extranjería debe contener entre 8 y 10 dígitos numéricos.';
    }
  } else if (tipoIdent.toUpperCase().includes('REGISTRO CIVIL')) {
    // Registro Civil: formato variable, al menos 7 caracteres alfanuméricos
    if (!/^[a-zA-Z0-9]{7,20}$/.test(nuiLimpio)) {
      return 'El Registro Civil debe contener entre 7 y 20 caracteres alfanuméricos.';
    }
  }

  return null; // Sin errores
}

// Función para validar número de teléfono
function validatePhoneNumber(telefono) {
  const telefonoLimpio = telefono.trim();

  // Debe ser exactamente 10 dígitos numéricos y empezar con 3 (formato colombiano)
  if (!/^3\d{9}$/.test(telefonoLimpio)) {
    return 'El teléfono debe contener exactamente 10 dígitos y comenzar con 3 (formato: 3XX XXX XXXX).';
  }

  return null; // Sin errores
}

// Función para mostrar/actualizar el mensaje de validación de forma dinámica
function updateValidationMessage() {
  const tipoIdentSelect = document.getElementById('conductor-tipo-ident');
  const nui = document.getElementById('conductor-nui').value;
  const validationMessageDiv = document.getElementById('nui-validation-message');

  if (!tipoIdentSelect.value || !nui) {
    // No mostrar mensaje si no hay tipo seleccionado o número vacío
    validationMessageDiv.style.display = 'none';
    return;
  }

  const tipoIdentText = tipoIdentSelect.options[tipoIdentSelect.selectedIndex].text;
  const error = validateIdentificationNumber(tipoIdentText, nui);

  if (error) {
    validationMessageDiv.textContent = error;
    validationMessageDiv.style.display = 'block';
    validationMessageDiv.style.color = '#ef4444'; // Color rojo para errores
  } else {
    validationMessageDiv.textContent = '✓ Formato válido';
    validationMessageDiv.style.display = 'block';
    validationMessageDiv.style.color = '#10b981'; // Color verde para válido
  }
}

// Función para mostrar/actualizar el mensaje de validación del teléfono de forma dinámica
function updatePhoneValidationMessage() {
  const telefono = document.getElementById('conductor-telefono').value;
  const validationMessageDiv = document.getElementById('telefono-validation-message');

  if (!telefono) {
    // No mostrar mensaje si el teléfono está vacío
    validationMessageDiv.style.display = 'none';
    return;
  }

  const error = validatePhoneNumber(telefono);

  if (error) {
    validationMessageDiv.textContent = error;
    validationMessageDiv.style.display = 'block';
    validationMessageDiv.style.color = '#ef4444'; // Color rojo para errores
  } else {
    validationMessageDiv.textContent = '✓ Teléfono válido';
    validationMessageDiv.style.display = 'block';
    validationMessageDiv.style.color = '#10b981'; // Color verde para válido
  }
}

// Validar formato de placa colombiana
function validatePlaca(placa) {
  if (!placa) return null;

  // Convertir a mayúsculas
  placa = placa.toUpperCase().trim();

  // Formato colombiano: 3 letras + 3 números (ABC123)
  const placaRegex = /^[A-Z]{3}[0-9]{3}$/;

  if (!placaRegex.test(placa)) {
    return 'La placa debe tener el formato: 3 letras seguidas de 3 números (Ej: ABC123)';
  }

  return null;
}

// Actualizar mensaje de validación de placa de forma dinámica
function updatePlacaValidationMessage() {
  const placa = document.getElementById('vehiculo-placa').value;
  const validationMessageDiv = document.getElementById('placa-validation-message');

  if (!placa) {
    validationMessageDiv.style.display = 'none';
    return;
  }

  const error = validatePlaca(placa);

  if (error) {
    validationMessageDiv.textContent = error;
    validationMessageDiv.style.display = 'block';
    validationMessageDiv.style.color = '#ef4444'; // Color rojo para errores
  } else {
    validationMessageDiv.textContent = '✓ Placa válida';
    validationMessageDiv.style.display = 'block';
    validationMessageDiv.style.color = '#10b981'; // Color verde para válido
  }
}

// Abrir modal para agregar conductor (restaurado)
async function openModalConductor() {
  window.editingId = null;
  document.getElementById('form-conductor').reset();
  const birthField = document.getElementById('conductor-birth-date');
  if (birthField) birthField.value = '';
  
  document.querySelector('#modal-conductor .modal-title').textContent = 'Agregar Conductor';

  // Cargar tipos de identificación
  const tiposIdent = await apiGet('/tipo_ident');
  ('Respuesta de tipo_ident:', tiposIdent);

  const selectTipo = document.getElementById('conductor-tipo-ident');
  selectTipo.innerHTML = '<option value="">Seleccione</option>';

  const tiposData = normalizeList(tiposIdent);
  const tiposFiltrados = tiposData.filter(t => t && t.id == 1); // Solo Cédula de Ciudadanía

  tiposFiltrados.forEach((t) => {
    selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
  });

  // Event listeners de validación dinámica
  document.getElementById('conductor-tipo-ident').addEventListener('change', updateValidationMessage);
  document.getElementById('conductor-nui').addEventListener('input', updateValidationMessage);
  document.getElementById('conductor-telefono').addEventListener('input', updatePhoneValidationMessage);

  document.getElementById('modal-conductor').style.display = 'flex';
}

// Guardar conductor
async function saveConductor(e) {
  e.preventDefault();

  const form = document.getElementById('form-conductor');
  if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
  }

  // Validar que todos los campos requeridos estén llenos
  const tipoIdent = document.getElementById('conductor-tipo-ident').value;
  const nui = document.getElementById('conductor-nui').value;
  const nombres = document.getElementById('conductor-nombres').value;
  const apellidos = document.getElementById('conductor-apellidos').value;
  const telefono = document.getElementById('conductor-telefono').value;
  const genero = document.getElementById('conductor-genero').value;
  const birthDate = document.getElementById('conductor-birth-date').value;

  if (!tipoIdent || !nui || !nombres || !apellidos || !telefono || !genero || !birthDate) {
    showNotification('warning', 'Campos incompletos', 'Por favor complete todos los campos requeridos:\n- Tipo de Identificación\n- Número de Identificación\n- Nombres\n- Apellidos\n- Teléfono\n- Género\n- Fecha de Nacimiento');
    return;
  }

  // Validar mayoría de edad en conductores
  if (birthDate) {
      const fechaNac = new Date(birthDate);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;

      if (edad < 18) {
          showNotification('error', 'Edad Inválida', `El conductor debe ser obligatoriamente mayor de edad. Edad calculada: ${edad} años.`);
          return;
      }
  }

  // Validar número de identificación según el tipo seleccionado
  const tipoIdentSelect = document.getElementById('conductor-tipo-ident');
  const tipoIdentText = tipoIdentSelect.options[tipoIdentSelect.selectedIndex].text;

  const validationError = validateIdentificationNumber(tipoIdentText, nui);
  if (validationError) {
    showNotification('error', 'Número de identificación inválido', validationError);
    return;
  }

  // Validar número de teléfono
  const phoneValidationError = validatePhoneNumber(telefono);
  if (phoneValidationError) {
    showNotification('error', 'Número de teléfono inválido', phoneValidationError);
    return;
  }

  // --- Anti doble-submit: deshabilitar botón ---
  const btnSubmit = e.target.querySelector('button[type="submit"]');
  if (btnSubmit && btnSubmit.disabled) return; // ya está procesando
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Guardando...';
  }

  // Datos de persona
  const personaData = {
    tipo_ident_id: tipoIdent
    , nui: nui
    , name: nombres
    , last_name: apellidos
    , phone_number: telefono
    , gender: genero
    , birth_date: birthDate
  };

  try {

      if (window.editingId) {
        // Modo edición: actualizar persona existente y conductor existente
        const conductor = await apiGet(`/conductores/${window.editingId}`);
        if (!conductor?.data?.persona_id) return;

        const personaResult = await apiPut(`/personas/${conductor.data.persona_id}`, personaData);
        if (personaResult) {
          const conductorUpdateResult = await apiPut(`/conductores/${window.editingId}`, { 
                persona_id: conductor.data.persona_id
          });
          if(conductorUpdateResult) {
            showNotification('success', '¡Éxito!', 'Conductor actualizado exitosamente');
            document.getElementById('modal-conductor').style.display = 'none';
            window.editingId = null;
            loadConductores();
          }
        }
      } else {
        // Modo creación: crear persona y luego conductor
        const personaResult = await apiPost('/personas', personaData);
        if (!personaResult) return;

        const conductorData = {
          persona_id: personaResult.data.id,
          estado: true,
          motivo_estado: null
        };

        const conductorResult = await apiPost('/conductores', conductorData);
        if (conductorResult) {
          showNotification('success', '¡Éxito!', 'Conductor creado exitosamente');
          document.getElementById('modal-conductor').style.display = 'none';
          loadConductores();
        }
      }
  } finally {
    // Siempre rehabilitar el botón al terminar
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Guardar';
    }
  }
}

// Eliminar conductor
async function deleteConductor(id) {
  showConfirm(
    'Eliminar Conductor'
    , '¿Estás seguro que deseas eliminar este conductor?'
    , async () => {
      const result = await apiDelete(`/conductores/${id}`);
      if (result) {
        showNotification('success', '¡Éxito!', 'Conductor eliminado');
        loadConductores();
      }
    }
  );
}

// Editar conductor
async function editConductor(id) {
  const response = await apiGet(`/conductores/${id}?include=persona`);
  const conductor = response?.data;
  if (!conductor || !conductor.persona) return;

  window.editingId = id;
  document.querySelector('#modal-conductor .modal-title').textContent = 'Editar Conductor';

  // Cargar tipos de identificación
  const tiposIdent = await apiGet('/tipo_ident');
  const selectTipo = document.getElementById('conductor-tipo-ident');
  selectTipo.innerHTML = '<option value="">Seleccione</option>';

  const tiposData = normalizeList(tiposIdent);
  const tiposFiltrados = tiposData.filter(t => t && t.id == 1);

  tiposFiltrados.forEach(t => {
    selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
  });

  // Rellenar formulario con datos de la persona
  const persona = conductor.persona;
  document.getElementById('conductor-tipo-ident').value = persona.tipo_ident_id || '';
  document.getElementById('conductor-nui').value = persona.nui || '';
  document.getElementById('conductor-nombres').value = persona.name || '';
  document.getElementById('conductor-apellidos').value = persona.last_name || '';
  document.getElementById('conductor-telefono').value = persona.phone_number || '';
  document.getElementById('conductor-genero').value = persona.gender || '';
  document.getElementById('conductor-birth-date').value = persona.birth_date || '';

  // Rellenar datos booleanos de status no aplica, visualmente solo actualizamos la info de persona

  document.getElementById('modal-conductor').style.display = 'flex';
}

// ==============================================
// GESTIÓN DE HISTORIAL DE NOVEDADES
// ==============================================

async function openModalNovedades(conductorId) {
    document.getElementById('form-novedad-conductor').reset();
    document.getElementById('novedad-conductor-id').value = conductorId;
    document.getElementById('novedad-otra').style.display = 'none';
    
    // Configurar select "Otra Razón"
    document.getElementById('novedad-tipo').onchange = (e) => {
        document.getElementById('novedad-otra').style.display = e.target.value === 'Otra Razón' ? 'block' : 'none';
        if(e.target.value === 'Otra Razón') {
            document.getElementById('novedad-otra').required = true;
        } else {
            document.getElementById('novedad-otra').required = false;
        }
    };

    await loadNovedades(conductorId);
    document.getElementById('modal-novedades').style.display = 'flex';
}

async function loadNovedades(conductorId) {
    const tableDiv = document.getElementById('novedades-conductor-table');
    tableDiv.innerHTML = '<div class="text-center p-4 text-gray-500">Cargando historial...</div>';

    const response = await apiGet(`/novedades-conductores?conductor_id=${conductorId}`);
    if (!response || !response.data) {
        tableDiv.innerHTML = '<div class="text-center p-4 text-gray-500">Error al cargar historial.</div>';
        return;
    }

    const data = normalizeList(response);
    if (data.length === 0) {
        tableDiv.innerHTML = '<div class="text-center p-4 text-gray-400">Sin historial de inactividad registrado. El conductor está totalmente activo.</div>';
        return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">';
    html += '<thead style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;"><tr><th style="padding: 8px;">Tipo</th><th style="padding: 8px;">Inicio</th><th style="padding: 8px;">Fin Est.</th><th style="padding: 8px;">Detalles</th><th style="padding: 8px; text-align: right;">Acciones</th></tr></thead><tbody>';

    data.forEach(n => {
        const isDeleted = n.deleted_at != null;
        const rowStyle = isDeleted ? 'background-color: #f9fafb; color: #9ca3af; border-bottom: 1px solid #e5e7eb;' : 'border-bottom: 1px solid #e5e7eb;';
        const statusBadge = isDeleted 
            ? '<span class="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600" style="display:inline-block; margin-top:2px;">Histórico</span>' 
            : '<span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700" style="display:inline-block; margin-top:2px;">Vigente</span>';

        html += `<tr style="${rowStyle}">
            <td style="padding: 8px; font-weight: 600;">
                ${n.tipo_novedad} <br> ${statusBadge}
            </td>
            <td style="padding: 8px;">${n.fecha_inicio}</td>
            <td style="padding: 8px;">${n.fecha_fin || '—'}</td>
            <td style="padding: 8px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${n.observaciones || ''}">${n.observaciones || '—'}</td>
            <td style="padding: 8px; text-align: right;">
                ${!isDeleted ? `
                <button type="button" class="btn-sm btn-delete-novedad" style="color:#ef4444; border:none; background:transparent; cursor:pointer;" onclick="deleteNovedadConductor(${n.id}, ${conductorId})" title="Finalizar e inhabilitar registro">
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

async function saveNovedadConductor(e) {
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    if (btnSubmit && btnSubmit.disabled) return;
    
    const conductorId = document.getElementById('novedad-conductor-id').value;
    const tipoSelect = document.getElementById('novedad-tipo').value;
    const tipo = tipoSelect === 'Otra Razón' ? document.getElementById('novedad-otra').value : tipoSelect;
    const inicio = document.getElementById('novedad-inicio').value;
    const fin = document.getElementById('novedad-fin').value;
    const obs = document.getElementById('novedad-obs').value;

    if (!tipo || !inicio) {
        showNotification('warning', 'Campos requeridos', 'Ingrese el Tipo de Novedad y la Fecha de Inicio.');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';
    }

    const payload = {
        conductor_id: conductorId,
        tipo_novedad: tipo,
        fecha_inicio: inicio,
        fecha_fin: fin || null,
        observaciones: obs || null
    };

    try {
        const res = await apiPost('/novedades-conductores', payload);
        if (res) {
            showNotification('success', '¡Registrado!', 'La novedad fue ingresada con éxito al historial.');
            document.getElementById('form-novedad-conductor').reset();
            document.getElementById('novedad-otra').style.display = 'none';
            await loadNovedades(conductorId);
            await loadConductores(); // Refrescar tabla principal para ver el badge INACTIVO
        }
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Registrar Novedad';
        }
    }
}

async function deleteNovedadConductor(novedadId, conductorId) {
    showConfirm(
        'Eliminar Novedad',
        '¿Estás seguro de eliminar este registro histórico? Si es el único registro activo, el conductor volverá a estar "Activo" legalmente.',
        async () => {
            const res = await apiDelete(`/novedades-conductores/${novedadId}`);
            if(res) {
                showNotification('success', 'Eliminado', 'Se ha borrado el registro del historial.');
                await loadNovedades(conductorId);
                await loadConductores();
            }
        }
    );
}


// Exponer al scope global
window.loadConductores = loadConductores;
window.validateIdentificationNumber = validateIdentificationNumber;
window.validatePhoneNumber = validatePhoneNumber;
window.updateValidationMessage = updateValidationMessage;
window.updatePhoneValidationMessage = updatePhoneValidationMessage;
window.validatePlaca = validatePlaca;
window.updatePlacaValidationMessage = updatePlacaValidationMessage;
window.openModalConductor = openModalConductor;
window.saveConductor = saveConductor;
window.deleteConductor = deleteConductor;
window.editConductor = editConductor;
window.openModalNovedades = openModalNovedades;
window.saveNovedadConductor = saveNovedadConductor;
window.deleteNovedadConductor = deleteNovedadConductor;