// ==========================
// 4. GESTIÓN DE VEHÍCULOS
// ==========================

// --- Auto-cálculo de vencimientos ---
function calcVencimientoSoat() {
  const expEl = document.getElementById('vehiculo-soat-expedicion');
  const vencEl = document.getElementById('vehiculo-soat');
  if (!expEl || !vencEl || !expEl.value) return;
  const exp = new Date(expEl.value + 'T00:00:00');
  exp.setFullYear(exp.getFullYear() + 1); // +12 meses
  vencEl.value = exp.toISOString().split('T')[0];
}

function calcVencimientoTecno() {
  const expTecnoEl = document.getElementById('vehiculo-tecno-expedicion');
  const vencEl = document.getElementById('vehiculo-tecno');
  if (!vencEl) return;

  // Si hay fecha de expedición de tecnomecánica (vehículo fuera de gracia), renovación → +12 meses
  if (expTecnoEl && expTecnoEl.value) {
    const exp = new Date(expTecnoEl.value + 'T00:00:00');
    exp.setFullYear(exp.getFullYear() + 1);
    vencEl.value = exp.toISOString().split('T')[0];
  }
}

// Evaluar si el vehículo está en período de gracia de Tecnomecánica (C2: 2 años desde matrícula)
function updateTecnoState() {
  const matriculaEl = document.getElementById('vehiculo-matricula');
  const expTecnoEl = document.getElementById('vehiculo-tecno-expedicion');
  const vencEl = document.getElementById('vehiculo-tecno');
  const archivoTecno = document.getElementById('vehiculo-tecno-archivo');
  const labelTecno = document.getElementById('label-archivo-tecno');
  const infoTecno = document.getElementById('tecno-gracia-info');
  if (!matriculaEl || !expTecnoEl || !vencEl) return;

  if (!matriculaEl.value) {
    // Sin matrícula, no podemos calcular nada - dejar habilitado
    expTecnoEl.disabled = false;
    expTecnoEl.required = true;
    if (infoTecno) infoTecno.style.display = 'none';
    return;
  }

  const matricula = new Date(matriculaEl.value + 'T00:00:00');
  const limiteGracia = new Date(matriculaEl.value + 'T00:00:00');
  limiteGracia.setFullYear(limiteGracia.getFullYear() + 2);
  const hoy = new Date();

  if (limiteGracia > hoy) {
    // Vehículo en período de gracia: NO necesita tecnomecánica todavía
    expTecnoEl.value = '';
    expTecnoEl.disabled = true;
    expTecnoEl.required = false;
    vencEl.value = limiteGracia.toISOString().split('T')[0];
    if (archivoTecno) { archivoTecno.required = false; archivoTecno.disabled = true; }
    if (labelTecno) labelTecno.textContent = 'Documento Tecnomecánica (No requerido - vehículo en gracia)';
    if (infoTecno) {
      infoTecno.textContent = 'Vehículo nuevo (C2): la primera revisión tecnomecánica se exige a los 2 años desde la matrícula (' + limiteGracia.toISOString().split('T')[0] + '). No se requiere expedición ni documento.';
      infoTecno.style.display = 'block';
    }
  } else {
    // Vehículo fuera de gracia: NECESITA tecnomecánica
    expTecnoEl.disabled = false;
    expTecnoEl.required = true;
    if (archivoTecno) { archivoTecno.disabled = false; }
    if (labelTecno && !window.editingId) labelTecno.textContent = 'Documento Tecnomecánica (PDF o imagen) *';
    if (infoTecno) {
      infoTecno.textContent = 'El vehículo superó los 2 años desde matrícula. Se requiere la revisión tecnomecánica vigente.';
      infoTecno.style.display = 'block';
    }
    // Si no hay expedición pero hay matrícula, poner vencimiento vacío para que el usuario lo llene
    if (!expTecnoEl.value) vencEl.value = '';
  }
}

// Aplicar restricción: la fecha de expedición del SOAT no puede ser anterior a la matrícula NI posterior a hoy
function updateSoatMinDate() {
  const matriculaEl = document.getElementById('vehiculo-matricula');
  const soatExpEl = document.getElementById('vehiculo-soat-expedicion');
  if (!matriculaEl || !soatExpEl) return;
  const hoy = new Date().toISOString().split('T')[0];
  // El SOAT no puede ser del futuro
  soatExpEl.max = hoy;
  // El SOAT no puede ser anterior a la matrícula
  if (matriculaEl.value) {
    soatExpEl.min = matriculaEl.value;
  }
  // Si la fecha ingresada no cumple, limpiar
  if (soatExpEl.value && matriculaEl.value && soatExpEl.value < matriculaEl.value) {
    soatExpEl.value = '';
    document.getElementById('vehiculo-soat').value = '';
  }
  if (soatExpEl.value && soatExpEl.value > hoy) {
    soatExpEl.value = '';
    document.getElementById('vehiculo-soat').value = '';
  }
}

function setupAutoCalcListeners() {
  const soatExp = document.getElementById('vehiculo-soat-expedicion');
  const tecnoExp = document.getElementById('vehiculo-tecno-expedicion');
  const matricula = document.getElementById('vehiculo-matricula');
  const hoy = new Date().toISOString().split('T')[0];

  // Restricciones de fecha máxima: no se puede poner una fecha futura
  if (soatExp) { soatExp.max = hoy; soatExp.onchange = calcVencimientoSoat; }
  if (tecnoExp) { tecnoExp.max = hoy; tecnoExp.onchange = calcVencimientoTecno; }
  if (matricula) {
    matricula.max = hoy;
    matricula.onchange = function() {
      updateTecnoState();
      updateSoatMinDate();
    };
  }
}

// --- Validación de Placa Colombiana ---
function validatePlaca(placa) {
  if (!placa || placa.length !== 6) return 'La placa debe tener exactamente 6 caracteres.';
  const regex = /^[A-Z]{3}\d{3}$/;
  if (!regex.test(placa)) return 'Formato de placa inválido. Debe ser 3 letras + 3 números (ej: ABC123).';
  return null;
}

function updatePlacaValidationMessage() {
  const placa = document.getElementById('vehiculo-placa').value.toUpperCase().trim();
  const msgEl = document.getElementById('placa-validation-message');
  if (!msgEl) return;
  const error = validatePlaca(placa);
  if (placa.length === 0) { msgEl.style.display = 'none'; return; }
  msgEl.style.display = 'block';
  if (error) { msgEl.textContent = error; msgEl.style.color = '#ef4444'; }
  else { msgEl.textContent = '✓ Formato de placa válido'; msgEl.style.color = '#10b981'; }
}

// --- Convertir nombre de color a CSS ---
function convertirColorEspanolACSS(colorNombre) {
  if (!colorNombre) return '#ccc';
  const coloresEspañol = {
    'rojo': '#dc2626', 'azul': '#2563eb', 'amarillo': '#eab308', 'verde': '#16a34a',
    'blanco': '#ffffff', 'negro': '#000000', 'gris': '#6b7280', 'naranja': '#ea580c',
    'morado': '#9333ea', 'rosa': '#ec4899', 'cafe': '#92400e', 'café': '#92400e',
    'marron': '#92400e', 'marrón': '#92400e', 'plateado': '#d1d5db', 'dorado': '#ca8a04',
    'celeste': '#38bdf8', 'turquesa': '#14b8a6', 'beige': '#d4c5b9', 'crema': '#fef3c7'
  };
  const colorLower = colorNombre.toLowerCase().trim();
  if (coloresEspañol[colorLower]) return coloresEspañol[colorLower];
  if (colorLower.startsWith('#') || colorLower.startsWith('rgb')) return colorNombre;
  const coloresIngles = ['red','blue','yellow','green','white','black','gray','orange','purple','pink','brown','silver','gold'];
  if (coloresIngles.includes(colorLower)) return colorNombre;
  return '#9ca3af';
}

function getSemaforo(fechaStr) {
  if (!fechaStr) return { color: '#ef4444', text: 'NO REGISTRADO' };
  const hoy = new Date();
  const venc = new Date(fechaStr.split('T')[0]);
  const diffDays = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { color: '#dc2626', text: 'VENCIDO' };
  if (diffDays <= 30) return { color: '#ea580c', text: 'POR VENCER' };
  return { color: '#16a34a', text: 'VIGENTE' };
}

// --- Cargar Lista de Vehículos ---
async function loadVehiculos() {
  const response = await apiGet('/vehiculos?include=tipo,propietario.persona,propietario.documento,documentoSoat,documentoTecno');
  const vehiculos = normalizeList(response);

  const asignacionesResp = await apiGet('/seguim-estado-veh?include=ruta');
  const asignacionesList = normalizeList(asignacionesResp);
  const vehiculoRutaMap = {};
  asignacionesList.forEach(a => {
    // Solo asignaciones ACTIVAS (sin fecha de fin)
    if (a.vehiculo_id && !a.fecha_hora_fin) {
      const ruta = a.ruta || {};
      vehiculoRutaMap[a.vehiculo_id] = ruta.nombre || ruta.name || ruta.descripcion || 'Ruta';
    }
  });

  if (vehiculos.length === 0) {
    document.getElementById('vehiculos-table').innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #6b7280;">
        <svg style="width: 64px; height: 64px; margin: 0 auto 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
        <p style="font-size: 1.1rem; font-weight: 500;">No hay vehículos registrados</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Comienza agregando tu primer vehículo a la flota</p>
      </div>`;
    return;
  }

  let html = '<div class="vehiculos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem;">';

  vehiculos.forEach((v) => {
    const tipo = v.tipo?.descripcion || 'Sin tipo';
    const colorCSS = convertirColorEspanolACSS(v.color);

    let nombrePropietario = 'Sin propietario';
    if (v.propietario) {
      if (v.propietario.persona) {
        const per = v.propietario.persona;
        nombrePropietario = `${per.name || ''} ${per.last_name || ''}`.trim() || `Propietario #${v.propietario_id}`;
      } else if (v.propietario.documento && v.propietario.documento.observaciones) {
        const obs = v.propietario.documento.observaciones;
        const match = obs.match(/Propietario:\s*([^,|\-]+)/);
        if (match && match[1]) nombrePropietario = match[1].trim();
        else nombrePropietario = `Propietario #${v.propietario_id}`;
      } else {
        nombrePropietario = `Propietario #${v.propietario_id}`;
      }
    } else if (v.propietario_id) {
      nombrePropietario = `Propietario #${v.propietario_id}`;
    }

    const enServicio = v.servicio ? 'Sí' : 'No';
    const estadoColor = v.servicio ? '#10b981' : '#6b7280';
    const estadoIcon = v.servicio ? '✓' : '✕';

    // Icono SVG según tipo de vehículo
    let vehiculoIcon = `<svg style="width:40px;height:40px;" fill="none" stroke="#6b7280" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>`;

    const soatSem = getSemaforo(v.fecha_vencimiento_soat);
    const tecnoSem = getSemaforo(v.fecha_vencimiento_tecno);

    // Indicador de documentos adjuntos
    const hasSoatDoc = v.documento_soat_id || (v.documento_soat && v.documento_soat.id);
    const hasTecnoDoc = v.documento_tecno_id || (v.documento_tecno && v.documento_tecno.id);
    const docsIcon = (hasSoatDoc && hasTecnoDoc)
      ? '<span style="color:#10b981; font-size:0.7rem;">● Documentos completos</span>'
      : '<span style="color:#ef4444; font-size:0.7rem;">● Faltan documentos</span>';

    html += `
      <div class="vehiculo-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; transition: all 0.2s;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="line-height: 1;">${vehiculoIcon}</div>
            <div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #1f2937; letter-spacing: 0.5px;">${v.placa || 'N/A'}</div>
              <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">${tipo}</div>
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; flex-direction:column; align-items:flex-end;">
            <div style="background: ${estadoColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;" title="Estado Legal de Operación dictado por la Secretaría">
              <span>S. Legal:</span><span>${estadoIcon}</span><span>${enServicio}</span>
            </div>
            <div style="background: ${(v.estado === false || v.estado === 0 || String(v.estado) === '0') ? '#ef4444' : '#10b981'}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;" title="Estado Operativo en Riesgos/Mantenimiento (Empresa)">
              <span>Operativo:</span><span>${(v.estado === false || v.estado === 0 || String(v.estado) === '0') ? '✕ NO' : '✓ SÍ'}</span>
            </div>
          </div>
        </div>

        <div style="display: grid; gap: 0.75rem; margin-bottom: 1.25rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Marca</span>
            <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${v.marca || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Modelo</span>
            <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${v.modelo || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Color</span>
            <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${colorCSS}; border: 2px solid #e5e7eb;"></span>
              ${v.color || 'N/A'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Propietario</span>
            <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${nombrePropietario}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">SOAT</span>
            <span style="font-weight: 700; font-size: 0.8rem; color: ${soatSem.color};">
              ${v.fecha_vencimiento_soat ? v.fecha_vencimiento_soat.split('T')[0] : 'N/A'} (${soatSem.text})
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Tecnomecánica</span>
            <span style="font-weight: 700; font-size: 0.8rem; color: ${tecnoSem.color};">
              ${v.fecha_vencimiento_tecno ? v.fecha_vencimiento_tecno.split('T')[0] : 'N/A'} (${tecnoSem.text})
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Documentos</span>
            ${docsIcon}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6b7280; font-size: 0.875rem;">Ruta Actual</span>
            <span style="color: #2563eb; font-weight: 700; font-size: 0.875rem;">${vehiculoRutaMap[v.id] || 'DISPONIBLE'}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          ${window.canUpdate('vehiculo') ? `
          <button onclick="editVehiculo(${v.id})" class="btn-edit" style="flex:1;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:16px; height:16px;">
              <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.5 6.5l4 4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Editar
          </button>
          <button onclick="openModalNovedadesVehiculo(${v.id})" class="btn-violet" style="flex:1;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:16px; height:16px;">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Novedades
          </button>` : ''}
          ${window.canDelete('vehiculo') ? `
          <button onclick="deleteVehiculo(${v.id})" class="btn-delete" style="flex:1;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:20px; height:20px;">
              <path d="M6 7h12" /><path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
              <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
            </svg>
            Eliminar
          </button>` : ''}
        </div>
      </div>`;
  });

  html += '</div>';
  document.getElementById('vehiculos-table').innerHTML = html;
}

// --- Eliminar vehículo ---
window.deleteVehiculo = async function (id) {
  showConfirm('Eliminar Vehículo', '¿Estás seguro que deseas eliminar este vehículo?', async () => {
    const result = await apiDelete(`/vehiculos/${id}`);
    if (result) { showNotification('success', '¡Éxito!', 'Vehículo eliminado'); loadVehiculos(); }
  });
};

// --- Editar vehículo ---
window.editVehiculo = async function (id) {
  const response = await apiGet(`/vehiculos/${id}`);
  const vehiculo = response?.data;
  if (!vehiculo) return;

  window.editingId = id;
  document.querySelector('#modal-vehiculo .modal-title').textContent = 'Editar Vehículo';

  // Cargar selects
  const tiposVeh = await apiGet('/tipo-vehiculo');
  const selectTipo = document.getElementById('vehiculo-tipo');
  selectTipo.innerHTML = '<option value="">Seleccione</option>';
  normalizeList(tiposVeh).forEach(t => { selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`; });

  const propietarios = await apiGet('/propietarios?include=persona,documento');
  const selectProp = document.getElementById('vehiculo-propietario');
  selectProp.innerHTML = '<option value="">Seleccione</option>';
  const propData = normalizeList(propietarios);
  if (propData.length === 0) {
    selectProp.innerHTML += `<option value="" disabled>No hay propietarios registrados</option>`;
  } else {
    propData.forEach(p => {
      let nombre = `Propietario #${p.id}`;
      if (p.persona) {
        nombre = `${p.persona.name || ''} ${p.persona.last_name || ''}`.trim() || nombre;
      } else if (p.documento && p.documento.observaciones) {
        const match = p.documento.observaciones.match(/Propietario:\s*([^,|\-]+)/);
        if (match && match[1]) nombre = match[1].trim();
      }
      selectProp.innerHTML += `<option value="${p.id}">${nombre}</option>`;
    });
  }

  // Rellenar formulario
  document.getElementById('vehiculo-placa').value = vehiculo.placa || '';
  document.getElementById('vehiculo-tipo').value = vehiculo.tipo_veh_id || '';
  document.getElementById('vehiculo-propietario').value = vehiculo.propietario_id || '';
  document.getElementById('vehiculo-modelo').value = vehiculo.modelo || '';
  document.getElementById('vehiculo-marca').value = vehiculo.marca || '';
  document.getElementById('vehiculo-color').value = vehiculo.color || '';
  document.getElementById('vehiculo-servicio').value = vehiculo.servicio ? '1' : '0';
  document.getElementById('vehiculo-matricula').value = vehiculo.fecha_matricula || '';

  // SOAT
  document.getElementById('vehiculo-soat-expedicion').value = vehiculo.fecha_expedicion_soat || '';
  document.getElementById('vehiculo-soat').value = vehiculo.fecha_vencimiento_soat ? vehiculo.fecha_vencimiento_soat.split('T')[0].split(' ')[0] : '';

  // Tecno
  document.getElementById('vehiculo-tecno-expedicion').value = vehiculo.fecha_expedicion_tecno || '';
  document.getElementById('vehiculo-tecno').value = vehiculo.fecha_vencimiento_tecno ? vehiculo.fecha_vencimiento_tecno.split('T')[0].split(' ')[0] : '';

  // Estado operativo
  document.getElementById('vehiculo-estado').value = (vehiculo.estado === true || vehiculo.estado === 1 || String(vehiculo.estado) === '1') ? '1' : '0';
  document.querySelector('.vehiculo-motivo-container').style.display = document.getElementById('vehiculo-estado').value === '0' ? 'block' : 'none';
  const motivoDb = vehiculo.motivo_estado || '';
  const isOtra = motivoDb && !document.querySelector(`#vehiculo-motivo option[value="${motivoDb}"]`);
  if (isOtra && motivoDb) {
    document.getElementById('vehiculo-motivo').value = 'Otra Razón';
    document.getElementById('vehiculo-otra-razon').value = motivoDb;
    document.getElementById('vehiculo-otra-razon').style.display = 'block';
  } else {
    document.getElementById('vehiculo-motivo').value = motivoDb;
    document.getElementById('vehiculo-otra-razon').style.display = 'none';
    document.getElementById('vehiculo-otra-razon').value = '';
  }

  // Mostrar info de documentos existentes
  const soatCurrent = document.getElementById('vehiculo-soat-current');
  const tecnoCurrent = document.getElementById('vehiculo-tecno-current');
  if (vehiculo.documento_soat_id) {
    soatCurrent.textContent = 'Documento SOAT ya cargado. Suba uno nuevo solo si desea reemplazarlo.';
    soatCurrent.style.display = 'block';
    document.getElementById('vehiculo-soat-archivo').required = false;
    document.getElementById('label-archivo-soat').textContent = 'Documento SOAT (Opcional para reemplazar)';
  } else { soatCurrent.style.display = 'none'; }

  if (vehiculo.documento_tecno_id) {
    tecnoCurrent.textContent = 'Documento Tecno ya cargado. Suba uno nuevo solo si desea reemplazarlo.';
    tecnoCurrent.style.display = 'block';
    document.getElementById('vehiculo-tecno-archivo').required = false;
    document.getElementById('label-archivo-tecno').textContent = 'Documento Tecno (Opcional para reemplazar)';
  } else { tecnoCurrent.style.display = 'none'; }

  // Evaluar estado de gracia de tecnomecánica y restricción de SOAT
  updateTecnoState();
  updateSoatMinDate();

  // Listeners
  document.getElementById('vehiculo-estado').onchange = function(e) {
    document.querySelector('.vehiculo-motivo-container').style.display = e.target.value === '0' ? 'block' : 'none';
    if (e.target.value === '1') { document.getElementById('vehiculo-motivo').value = ''; document.getElementById('vehiculo-otra-razon').style.display = 'none'; }
  };
  document.getElementById('vehiculo-motivo').onchange = function(e) {
    document.getElementById('vehiculo-otra-razon').style.display = e.target.value === 'Otra Razón' ? 'block' : 'none';
  };
  setupAutoCalcListeners();

  document.getElementById('modal-vehiculo').style.display = 'flex';
};

// --- Abrir modal para agregar vehículo ---
async function openModalVehiculo() {
  window.editingId = null;
  document.getElementById('form-vehiculo').reset();
  document.querySelector('#modal-vehiculo .modal-title').textContent = 'Agregar Vehículo';

  // Reset nuevos campos
  document.getElementById('vehiculo-matricula').value = '';
  document.getElementById('vehiculo-soat-expedicion').value = '';
  document.getElementById('vehiculo-soat').value = '';
  document.getElementById('vehiculo-tecno-expedicion').value = '';
  document.getElementById('vehiculo-tecno').value = '';
  document.getElementById('vehiculo-soat-archivo').required = true;
  document.getElementById('vehiculo-tecno-archivo').required = true;
  document.getElementById('label-archivo-soat').textContent = 'Documento SOAT (PDF o imagen) *';
  document.getElementById('label-archivo-tecno').textContent = 'Documento Tecnomecánica (PDF o imagen) *';
  document.getElementById('vehiculo-soat-current').style.display = 'none';
  document.getElementById('vehiculo-tecno-current').style.display = 'none';

  // Reset Estado y Motivo
  document.getElementById('vehiculo-estado').value = '1';
  document.querySelector('.vehiculo-motivo-container').style.display = 'none';
  document.getElementById('vehiculo-otra-razon').style.display = 'none';
  document.getElementById('vehiculo-otra-razon').value = '';

  // Listeners
  document.getElementById('vehiculo-estado').onchange = function(e) {
    document.querySelector('.vehiculo-motivo-container').style.display = e.target.value === '0' ? 'block' : 'none';
    if (e.target.value === '1') { document.getElementById('vehiculo-motivo').value = ''; document.getElementById('vehiculo-otra-razon').style.display = 'none'; }
  };
  document.getElementById('vehiculo-motivo').onchange = function(e) {
    document.getElementById('vehiculo-otra-razon').style.display = e.target.value === 'Otra Razón' ? 'block' : 'none';
  };
  setupAutoCalcListeners();
  // Evaluar estado inicial de tecnomecánica (por si ya se cargó matrícula)
  updateTecnoState();
  updateSoatMinDate();

  // Cargar tipos de vehículo
  const tiposVeh = await apiGet('/tipo-vehiculo');
  const selectTipo = document.getElementById('vehiculo-tipo');
  selectTipo.innerHTML = '<option value="">Seleccione</option>';
  normalizeList(tiposVeh).forEach(t => { selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`; });

  // Cargar propietarios
  const propietarios = await apiGet('/propietarios?include=persona');
  const selectProp = document.getElementById('vehiculo-propietario');
  selectProp.innerHTML = '<option value="">Seleccione</option>';
  const propData = normalizeList(propietarios);
  if (propData.length === 0) {
    selectProp.innerHTML += `<option value="" disabled>No hay propietarios registrados</option>`;
  } else {
    propData.forEach(p => {
      let nombre = `Propietario #${p.id}`;
      if (p.persona) {
        nombre = `${p.persona.name || ''} ${p.persona.last_name || ''}`.trim() || nombre;
      }
      selectProp.innerHTML += `<option value="${p.id}">${nombre}</option>`;
    });
  }

  document.getElementById('vehiculo-placa').addEventListener('input', updatePlacaValidationMessage);
  document.getElementById('modal-vehiculo').style.display = 'flex';
}

// --- Guardar vehículo ---
async function saveVehiculo(e) {
  e.preventDefault();

  const form = document.getElementById('form-vehiculo');
  if (form && !form.checkValidity()) { form.reportValidity(); return; }

  const placa = document.getElementById('vehiculo-placa').value.toUpperCase().trim();
  const placaError = validatePlaca(placa);
  if (placaError) { showNotification('error', 'Placa inválida', placaError); return; }

  // Validar SOAT
  if (!document.getElementById('vehiculo-soat').value) {
    showNotification('warning', 'Validación', 'Ingrese la fecha de expedición del SOAT para calcular el vencimiento.');
    return;
  }

  // Validar coherencia: SOAT no puede ser anterior a matrícula
  const fechaMatricula = document.getElementById('vehiculo-matricula').value;
  const fechaSoatExp = document.getElementById('vehiculo-soat-expedicion').value;
  if (fechaMatricula && fechaSoatExp && fechaSoatExp < fechaMatricula) {
    showNotification('error', 'Fecha inválida', 'La expedición del SOAT no puede ser anterior a la fecha de matrícula del vehículo.');
    return;
  }

  // Validar Tecno (solo si el vehículo NO está en período de gracia)
  const tecnoExpEl = document.getElementById('vehiculo-tecno-expedicion');
  if (!tecnoExpEl.disabled && !document.getElementById('vehiculo-tecno').value) {
    showNotification('warning', 'Validación', 'Ingrese la fecha de expedición de la Tecnomecánica para calcular el vencimiento.');
    return;
  }

  // Validar archivos obligatorios (solo en creación o si no hay doc previo)
  const archivoSoat = document.getElementById('vehiculo-soat-archivo').files[0];
  const archivoTecno = document.getElementById('vehiculo-tecno-archivo').files[0];

  const tecnoEnGracia = document.getElementById('vehiculo-tecno-expedicion').disabled;

  if (!window.editingId && !archivoSoat) {
    showNotification('warning', 'Documento Obligatorio', 'Debe adjuntar el documento del SOAT para registrar un vehículo.');
    return;
  }
  if (!window.editingId && !archivoTecno && !tecnoEnGracia) {
    showNotification('warning', 'Documento Obligatorio', 'Debe adjuntar el documento de la Tecnomecánica para registrar un vehículo.');
    return;
  }

  const estadoBol = document.getElementById('vehiculo-estado').value === '1';
  const motivoRaw = document.getElementById('vehiculo-motivo').value;
  const motivoFinal = estadoBol ? null : (motivoRaw === 'Otra Razón' ? document.getElementById('vehiculo-otra-razon').value : motivoRaw);

  const btnSubmit = e.target.querySelector('button[type="submit"]');
  if (btnSubmit && btnSubmit.disabled) return;
  if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

  try {
    // Paso 1: Subir documentos si hay archivos nuevos
    let documentoSoatId = null;
    let documentoTecnoId = null;

    if (archivoSoat) {
      const formData = new FormData();
      formData.append('file', archivoSoat);
      formData.append('observaciones', `SOAT - Vehículo placa: ${placa}`);
      formData.append('tipo_doc_id', 1);
      const docResult = await apiPostFile('/documentos', formData);
      if (docResult && docResult.data) documentoSoatId = docResult.data.id;
    }

    if (archivoTecno) {
      const formData = new FormData();
      formData.append('file', archivoTecno);
      formData.append('observaciones', `Tecnomecánica - Vehículo placa: ${placa}`);
      formData.append('tipo_doc_id', 1);
      const docResult = await apiPostFile('/documentos', formData);
      if (docResult && docResult.data) documentoTecnoId = docResult.data.id;
    }

    // Paso 2: Construir datos del vehículo
    const vehiculoData = {
      placa: placa,
      tipo_veh_id: document.getElementById('vehiculo-tipo').value,
      propietario_id: document.getElementById('vehiculo-propietario').value,
      modelo: document.getElementById('vehiculo-modelo').value,
      marca: document.getElementById('vehiculo-marca').value,
      color: document.getElementById('vehiculo-color').value,
      estado: estadoBol,
      motivo_estado: motivoFinal,
      fecha_matricula: document.getElementById('vehiculo-matricula').value,
      fecha_expedicion_soat: document.getElementById('vehiculo-soat-expedicion').value,
      fecha_vencimiento_soat: document.getElementById('vehiculo-soat').value,
      fecha_expedicion_tecno: document.getElementById('vehiculo-tecno-expedicion').value,
      fecha_vencimiento_tecno: document.getElementById('vehiculo-tecno').value,
    };

    if (documentoSoatId) vehiculoData.documento_soat_id = documentoSoatId;
    if (documentoTecnoId) vehiculoData.documento_tecno_id = documentoTecnoId;

    // Paso 3: Crear o Actualizar
    let result;
    if (window.editingId) {
      result = await apiPut(`/vehiculos/${window.editingId}`, vehiculoData);
    } else {
      result = await apiPost('/vehiculos', vehiculoData);
    }
    if (result) {
      showNotification('success', '¡Éxito!', 'Vehículo guardado exitosamente');
      document.getElementById('modal-vehiculo').style.display = 'none';
      loadVehiculos();
    }
  } finally {
    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Guardar'; }
  }
}

// Exponer al scope global
window.loadVehiculos = loadVehiculos;
window.openModalVehiculo = openModalVehiculo;
window.saveVehiculo = saveVehiculo;
window.openModalNovedadesVehiculo = openModalNovedadesVehiculo;
window.saveNovedadVehiculo = saveNovedadVehiculo;
window.deleteNovedadVehiculo = deleteNovedadVehiculo;

// --- GESTIÓN DE HISTORIAL DE NOVEDADES DE VEHÍCULOS ---
async function openModalNovedadesVehiculo(vehiculoId) {
    console.log('Abriendo modal de novedades para vehículo:', vehiculoId);
    document.getElementById('form-novedad-vehiculo').reset();
    document.getElementById('novedad-vehiculo-id').value = vehiculoId;
    
    // Mostrar modal de inmediato para feedback visual
    document.getElementById('modal-novedades-vehiculo').style.display = 'flex';
    
    await loadNovedadesVehiculo(vehiculoId);
}

async function loadNovedadesVehiculo(vehiculoId) {
    const tableDiv = document.getElementById('novedades-vehiculo-table');
    tableDiv.innerHTML = '<div class="text-center p-4 text-gray-500">Cargando historial...</div>';

    const response = await apiGet(`/novedades-vehiculos?vehiculo_id=${vehiculoId}`);
    const data = normalizeList(response);

    if (data.length === 0) {
        tableDiv.innerHTML = '<div class="text-center p-4 text-gray-400">Sin historial de inactividad. El vehículo está operativo.</div>';
        return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">';
    html += '<thead style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;"><tr><th style="padding: 8px;">Tipo</th><th style="padding: 8px;">Inicio</th><th style="padding: 8px;">Fin Est.</th><th style="padding: 8px;">Detalles</th><th style="padding: 8px; text-align: right;">Acciones</th></tr></thead><tbody>';

    data.forEach(n => {
        const isDeleted = n.deleted_at != null;
        const rowStyle = isDeleted ? 'background-color: #fafafa; color: #9ca3af;' : '';
        const statusBadge = isDeleted 
            ? '<span class="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">Histórico</span>' 
            : '<span class="px-2 py-1 text-xs rounded bg-teal-100 text-teal-700">Vigente</span>';

        html += `<tr style="${rowStyle} border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: 600;">
                ${n.tipo_novedad} <br> ${statusBadge}
            </td>
            <td style="padding: 8px;">${n.fecha_inicio}</td>
            <td style="padding: 8px;">${n.fecha_fin || '—'}</td>
            <td style="padding: 8px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${n.observaciones || ''}">${n.observaciones || '—'}</td>
            <td style="padding: 8px; text-align: right;">
                ${!isDeleted ? `
                <button type="button" style="color:#ef4444; border:none; background:transparent; cursor:pointer;" onclick="deleteNovedadVehiculo(${n.id}, ${vehiculoId})" title="Finalizar e inactivar registro">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:16px; height:16px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                ` : '<span style="font-size:0.7rem; font-style:italic;">Archivado</span>'}
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

async function saveNovedadVehiculo(e) {
    if (e) e.preventDefault();
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    if (btnSubmit && btnSubmit.disabled) return;
    
    const vehiculoId = document.getElementById('novedad-vehiculo-id').value;
    const tipo = document.getElementById('novedad-vehiculo-tipo').value;
    const inicio = document.getElementById('novedad-vehiculo-inicio').value;
    const fin = document.getElementById('novedad-vehiculo-fin').value;
    const obs = document.getElementById('novedad-vehiculo-obs').value;

    if (!tipo || !inicio) {
        showNotification('warning', 'Campos requeridos', 'Ingrese el Tipo de Novedad y la Fecha de Inicio.');
        return;
    }

    if (tipo === 'Otro' && !obs) {
        showNotification('warning', 'Observación requerida', 'Al seleccionar "Otro", debe especificar los detalles en las observaciones.');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';
    }

    try {
        const res = await apiPost('/novedades-vehiculos', {
            vehiculo_id: vehiculoId,
            tipo_novedad: tipo,
            fecha_inicio: inicio,
            fecha_fin: fin || null,
            observaciones: obs || null
        });

        if (res) {
            showNotification('success', '¡Registrado!', 'La novedad fue ingresada con éxito.');
            document.getElementById('form-novedad-vehiculo').reset();
            await loadNovedadesVehiculo(vehiculoId);
            await loadVehiculos(); // Recargar tarjetas para ver el estado "INACTIVO"
        }
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Registrar Novedad';
        }
    }
}

async function deleteNovedadVehiculo(novedadId, vehiculoId) {
    if (!confirm('¿Deseas finalizar esta novedad? El vehículo volverá a estar disponible operativamente.')) return;
    
    const res = await apiDelete(`/novedades-vehiculos/${novedadId}`);
    if (res) {
        showNotification('success', 'Finalizada', 'Novedad archivada y vehículo reactivado.');
        await loadNovedadesVehiculo(vehiculoId);
        await loadVehiculos();
    }
}