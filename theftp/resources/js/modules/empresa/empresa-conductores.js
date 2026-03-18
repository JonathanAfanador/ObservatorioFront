// ==========================
// 2. GESTIÓN DE CONDUCTORES
// ==========================
async function loadConductores() {
  const response = await apiGet('/conductores?include=persona,persona.tipo_ident');
  const conductores = normalizeList(response);

  if (conductores.length > 0) {
    ('Primer conductor completo:', JSON.stringify(conductores[0], null, 2));
  }

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

    (`Conductor ${index}: NUI=${nui}, Nombre=${nombreCompleto}, Telefono=${telefono}, Genero=${genero}, TipoIdent=${tipoIdentDesc}`);

    const generoDisplay = genero === 'Hombre' ? '👨 Hombre' : genero === 'Mujer' ? '👩 Mujer' : 'N/A';

    html += `
            <div class="conductor-card" data-conductor-id="${c.id}">
                <div class="conductor-card-header">
                    <div class="conductor-avatar">
                        ${iniciales}
                    </div>
                    <div class="conductor-card-title">
                        <h4>${nombreCompleto}</h4>
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
                </div>

                <div class="conductor-card-footer">
                    <button class="btn-edit btn-sm btn-edit-conductor" data-conductor-id="${c.id}" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px;">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" />
                            <path d="M13.5 6.5l4 4" />
                        </svg>
                        Editar
                    </button>
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

// Función para mostrar/actualizar el mensaje de validación en tiempo real
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

// Función para mostrar/actualizar el mensaje de validación del teléfono en tiempo real
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

// Actualizar mensaje de validación de placa en tiempo real
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
  document.querySelector('#modal-conductor .modal-title').textContent = 'Agregar Conductor';

  // Cargar tipos de identificación
  const tiposIdent = await apiGet('/tipo_ident');
  ('Respuesta de tipo_ident:', tiposIdent);

  const selectTipo = document.getElementById('conductor-tipo-ident');
  selectTipo.innerHTML = '<option value="">Seleccione</option>';

  const tiposData = normalizeList(tiposIdent);
  const tiposPermitidos = ['CÉDULA DE CIUDADANÍA', 'CÉDULA DE EXTRANJERÍA', 'REGISTRO CIVIL'];
  const tiposFiltrados = tiposData.filter(t => t && t.descripcion && tiposPermitidos.includes(t.descripcion.toUpperCase()));

  tiposFiltrados.forEach((t) => {
    if (t && t.id && t.descripcion) {
      selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
    }
  });

  // Event listeners de validación en tiempo real
  document.getElementById('conductor-tipo-ident').addEventListener('change', updateValidationMessage);
  document.getElementById('conductor-nui').addEventListener('input', updateValidationMessage);
  document.getElementById('conductor-telefono').addEventListener('input', updatePhoneValidationMessage);

  document.getElementById('modal-conductor').style.display = 'flex';
}

// Guardar conductor
async function saveConductor(e) {
  e.preventDefault();

  // Validar que todos los campos requeridos estén llenos
  const tipoIdent = document.getElementById('conductor-tipo-ident').value;
  const nui = document.getElementById('conductor-nui').value;
  const nombres = document.getElementById('conductor-nombres').value;
  const apellidos = document.getElementById('conductor-apellidos').value;
  const telefono = document.getElementById('conductor-telefono').value;
  const genero = document.getElementById('conductor-genero').value;

  if (!tipoIdent || !nui || !nombres || !apellidos || !telefono || !genero) {
    showNotification('warning', 'Campos incompletos', 'Por favor complete todos los campos requeridos:\n- Tipo de Identificación\n- Número de Identificación\n- Nombres\n- Apellidos\n- Teléfono\n- Género');
    return;
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

  // Datos de persona
  const personaData = {
    tipo_ident_id: tipoIdent
    , nui: nui
    , name: nombres
    , last_name: apellidos
    , phone_number: telefono
    , gender: genero
  };

  if (window.editingId) {
    // Modo edición: actualizar persona existente
    const conductor = await apiGet(`/conductores/${window.editingId}`);
    if (!conductor?.data?.persona_id) return;

    const personaResult = await apiPut(`/personas/${conductor.data.persona_id}`, personaData);
    if (personaResult) {
      showNotification('success', '¡Éxito!', 'Conductor actualizado exitosamente');
      document.getElementById('modal-conductor').style.display = 'none';
      window.editingId = null;
      loadConductores();
    }
  } else {
    // Modo creación: crear persona y luego conductor
    const personaResult = await apiPost('/personas', personaData);
    if (!personaResult) return;

    const conductorData = {
      persona_id: personaResult.data.id
    };

    const conductorResult = await apiPost('/conductores', conductorData);
    if (conductorResult) {
      showNotification('success', '¡Éxito!', 'Conductor creado exitosamente');
      document.getElementById('modal-conductor').style.display = 'none';
      loadConductores();
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
  // Filtrar solo: Cédula de Ciudadanía, Cédula de Extranjería y Registro Civil
  const tiposPermitidos = ['CÉDULA DE CIUDADANÍA', 'CÉDULA DE EXTRANJERÍA', 'REGISTRO CIVIL'];
  const tiposFiltrados = tiposData.filter(t => t && t.descripcion && tiposPermitidos.includes(t.descripcion.toUpperCase()));

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

  document.getElementById('modal-conductor').style.display = 'flex';
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