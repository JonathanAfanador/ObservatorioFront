// ==========================
// 4. GESTIÓN DE VEHÍCULOS
// ==========================
async function loadVehiculos() {
  const response = await apiGet('/vehiculos?include=tipo,propietario.documento');
  const vehiculos = normalizeList(response);

  if (vehiculos.length === 0) {
    document.getElementById('vehiculos-table').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #6b7280;">
                <svg style="width: 64px; height: 64px; margin: 0 auto 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <p style="font-size: 1.1rem; font-weight: 500;">No hay vehículos registrados</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Comienza agregando tu primer vehículo a la flota</p>
            </div>
        `;
    return;
  }

  // Función para convertir nombres de colores en español a CSS
  function convertirColorEspanolACSS(colorNombre) {
    if (!colorNombre) return '#ccc';

    const coloresEspañol = {
      'rojo': '#dc2626'
      , 'azul': '#2563eb'
      , 'amarillo': '#eab308'
      , 'verde': '#16a34a'
      , 'blanco': '#ffffff'
      , 'negro': '#000000'
      , 'gris': '#6b7280'
      , 'naranja': '#ea580c'
      , 'morado': '#9333ea'
      , 'rosa': '#ec4899'
      , 'cafe': '#92400e'
      , 'café': '#92400e'
      , 'marron': '#92400e'
      , 'marrón': '#92400e'
      , 'plateado': '#d1d5db'
      , 'dorado': '#ca8a04'
      , 'celeste': '#38bdf8'
      , 'turquesa': '#14b8a6'
      , 'beige': '#d4c5b9'
      , 'crema': '#fef3c7'
    };

    const colorLower = colorNombre.toLowerCase().trim();

    // Si es un color válido en el mapa, retornarlo
    if (coloresEspañol[colorLower]) {
      return coloresEspañol[colorLower];
    }

    // Si ya es un código hex válido o un color CSS, retornarlo tal cual
    if (colorLower.startsWith('#') || colorLower.startsWith('rgb')) {
      return colorNombre;
    }

    // Colores en inglés que CSS entiende directamente
    const coloresIngles = ['red', 'blue', 'yellow', 'green', 'white', 'black', 'gray', 'orange', 'purple', 'pink', 'brown', 'silver', 'gold'];
    if (coloresIngles.includes(colorLower)) {
      return colorNombre;
    }

    // Si no coincide con nada, retornar gris por defecto
    return '#9ca3af';
  }

  let html = '<div class="vehiculos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem;">';

  vehiculos.forEach((v) => {
    const tipo = v.tipo?.descripcion || 'Sin tipo';

    // Convertir el color del vehículo a CSS válido
    const colorCSS = convertirColorEspanolACSS(v.color);

    // Extraer nombre del propietario
    let nombrePropietario = 'Sin propietario';
    if (v.propietario && v.propietario.documento && v.propietario.documento.observaciones) {
      const obs = v.propietario.documento.observaciones;
      const match = obs.match(/Propietario:\s*([^-]+)/);
      if (match && match[1]) {
        nombrePropietario = match[1].trim();
      } else {
        nombrePropietario = `Propietario #${v.propietario_id}`;
      }
    } else if (v.propietario_id) {
      nombrePropietario = `Propietario #${v.propietario_id}`;
    }

    const enServicio = v.servicio ? 'Sí' : 'No';
    const estadoColor = v.servicio ? '#10b981' : '#6b7280';
    const estadoIcon = v.servicio ? '✓' : '✕';

    // Icono según el tipo de vehículo
    let vehiculoIcon = '🚗';
    if (tipo.toLowerCase().includes('bus')) vehiculoIcon = '🚌';
    else if (tipo.toLowerCase().includes('micro')) vehiculoIcon = '🚐';
    else if (tipo.toLowerCase().includes('taxi')) vehiculoIcon = '🚕';
    else if (tipo.toLowerCase().includes('moto')) vehiculoIcon = '🏍️';
    else if (tipo.toLowerCase().includes('camion')) vehiculoIcon = '🚚';

    html += `
            <div class="vehiculo-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="font-size: 2.5rem; line-height: 1;">${vehiculoIcon}</div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: #1f2937; letter-spacing: 0.5px;">${v.placa || 'N/A'}</div>
                            <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">${tipo}</div>
                        </div>
                    </div>
                    <div style="background: ${estadoColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">
                        <span>${estadoIcon}</span>
                        <span>${enServicio}</span>
                    </div>
                </div>

                <div style="display: grid; gap: 0.75rem; margin-bottom: 1.25rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Marca
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${v.marca || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Modelo
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${v.modelo || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            Color
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${colorCSS}; border: 2px solid #e5e7eb;"></span>
                            ${v.color || 'N/A'}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Propietario
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${nombrePropietario}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editVehiculo(${v.id})" class="btn-edit btn-sm" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px;">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" />
                            <path d="M13.5 6.5l4 4" />
                        </svg>
                        Editar
                    </button>
                    <button onclick="deleteVehiculo(${v.id})" class="btn-delete btn-sm" style="flex:1;">
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
  });

  html += '</div>';
  document.getElementById('vehiculos-table').innerHTML = html;
}

// Eliminar vehículo
window.deleteVehiculo = async function (id) {
  showConfirm(
    'Eliminar Vehículo'
    , '¿Estás seguro que deseas eliminar este vehículo?'
    , async () => {
      const result = await apiDelete(`/vehiculos/${id}`);
      if (result) {
        showNotification('success', '¡Éxito!', 'Vehículo eliminado');
        loadVehiculos();
      }
    }
  );
};

// Editar vehículo
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

  const tiposVehData = normalizeList(tiposVeh);
  tiposVehData.forEach(t => {
    selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
  });

  const propietarios = await apiGet('/propietarios?include=documento');
  const selectProp = document.getElementById('vehiculo-propietario');
  selectProp.innerHTML = '<option value="">Seleccione</option>';

  const propietariosData = normalizeList(propietarios);

  if (propietariosData.length === 0) {
    selectProp.innerHTML += `<option value="" disabled>No hay propietarios registrados</option>`;
  } else {
    propietariosData.forEach(p => {
      let nombrePropietario = `Propietario #${p.id}`;
      if (p.documento && p.documento.observaciones) {
        const obs = p.documento.observaciones;
        const match = obs.match(/Propietario:\s*([^-]+)/);
        if (match && match[1]) {
          nombrePropietario = match[1].trim();
        }
      }
      selectProp.innerHTML += `<option value="${p.id}">${nombrePropietario}</option>`;
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

  document.getElementById('modal-vehiculo').style.display = 'flex';
};

// Abrir modal para agregar vehículo
async function openModalVehiculo() {
  window.editingId = null;
  document.getElementById('form-vehiculo').reset();
  document.querySelector('#modal-vehiculo .modal-title').textContent = 'Agregar Vehículo';

  // Cargar tipos de vehículo
  const tiposVeh = await apiGet('/tipo-vehiculo');
  const selectTipo = document.getElementById('vehiculo-tipo');
  selectTipo.innerHTML = '<option value="">Seleccione</option>';

  const tiposVehData = normalizeList(tiposVeh);
  tiposVehData.forEach(t => {
    selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
  });

  // Cargar propietarios
  const propietarios = await apiGet('/propietarios?include=documento');
  const selectProp = document.getElementById('vehiculo-propietario');
  selectProp.innerHTML = '<option value="">Seleccione</option>';

  const propietariosData = normalizeList(propietarios);

  if (propietariosData.length === 0) {
    selectProp.innerHTML += `<option value="" disabled>No hay propietarios registrados</option>`;
  } else {
    propietariosData.forEach(p => {
      let nombrePropietario = `Propietario #${p.id}`;
      if (p.documento && p.documento.observaciones) {
        const obs = p.documento.observaciones;
        const match = obs.match(/Propietario:\s*([^-]+)/);
        if (match && match[1]) {
          nombrePropietario = match[1].trim();
        }
      }
      selectProp.innerHTML += `<option value="${p.id}">${nombrePropietario}</option>`;
    });
  }

  // Agregar event listener para validación de placa en tiempo real
  document.getElementById('vehiculo-placa').addEventListener('input', updatePlacaValidationMessage);

  document.getElementById('modal-vehiculo').style.display = 'flex';
}

// Guardar vehículo
async function saveVehiculo(e) {
  e.preventDefault();

  const placa = document.getElementById('vehiculo-placa').value.toUpperCase().trim();

  const placaError = validatePlaca(placa);
  if (placaError) {
    showNotification('error', 'Placa inválida', placaError);
    return;
  }

  const vehiculoData = {
    placa: placa
    , tipo_veh_id: document.getElementById('vehiculo-tipo').value
    , propietario_id: document.getElementById('vehiculo-propietario').value
    , modelo: document.getElementById('vehiculo-modelo').value
    , marca: document.getElementById('vehiculo-marca').value
    , color: document.getElementById('vehiculo-color').value
    , servicio: document.getElementById('vehiculo-servicio').value === '1'
  };

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
}

// Exponer al scope global
window.loadVehiculos = loadVehiculos;
window.openModalVehiculo = openModalVehiculo;
window.saveVehiculo = saveVehiculo;