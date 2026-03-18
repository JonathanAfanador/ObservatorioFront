// ==========================
// 6. ASIGNACIONES VEH-RUTA
// ==========================
async function loadAsignaciones() {
  const response = await apiGet('/seguim-estado-veh');
  const asignaciones = normalizeList(response);

  if (asignaciones.length === 0) {
    document.getElementById('asignaciones-table').innerHTML = '';
    return;
  }

  // Detectar si la API devolvió objetos anidados o solo IDs
  const needsVehiculoMap = asignaciones.some(a => !(a.vehiculo && a.vehiculo.placa));
  const needsRutaMap = asignaciones.some(a => !(a.ruta && (a.ruta.nombre || a.ruta.name)));
  const needsUsuarioMap = asignaciones.some(a => !(a.usuario && (a.usuario.name || a.usuario.nombre)));

  // Mapas por id
  const vehiculoMap = new Map(); // id -> placa
  const rutaMap = new Map(); // id -> nombre
  const usuarioMap = new Map(); // id -> nombre

  // Cargar catálogos solo si es necesario
  try {
    if (needsVehiculoMap) {
      const vehResp = await apiGet('/vehiculos');
      const vehiculos = normalizeList(vehResp);
      vehiculos.forEach(v => {
        if (v && v.id) vehiculoMap.set(v.id, v.placa || v.plate || v.placa);
      });
    }
  } catch (e) {
    console.debug('loadAsignaciones: no se pudo cargar vehiculos', e);
  }

  try {
    if (needsRutaMap) {
      const rutasResp = await apiGet('/rutas');
      const rutas = normalizeList(rutasResp);
      rutas.forEach(r => {
        if (r && r.id) rutaMap.set(r.id, r.nombre || r.name || r.title || `Ruta #${r.id}`);
      });
    }
  } catch (e) {
    console.debug('loadAsignaciones: no se pudo cargar rutas', e);
  }

  try {
    if (needsUsuarioMap) {
      // Intentar múltiples endpoints comunes para usuarios
      const userEndpoints = ['/users', '/usuarios', '/users?per_page=999', '/usuarios?per_page=999'];
      for (const ep of userEndpoints) {
        try {
          const uresp = await apiGet(ep);
          if (!uresp) continue;
          const users = normalizeList(uresp);
          if (users.length > 0) {
            users.forEach(u => {
              if (u && u.id) usuarioMap.set(u.id, u.name || u.nombre || u.email || `Usuario #${u.id}`);
            });
            break;
          }
        } catch (err) {
          // continuar intentando otros endpoints
        }
      }
    }
  } catch (e) {
    console.debug('loadAsignaciones: no se pudo cargar usuarios', e);
  }

  // Si aún faltan usuarios en el mapa, intentar solicitarlos por id individualmente
  try {
    // 1. Obtener IDs de usuario faltantes
    const missingUserIds = new Set();
    asignaciones.forEach(a => {
      const uid = a.usuario_id || (a.usuario && a.usuario.id) || null;
      if (uid && !usuarioMap.has(uid)) missingUserIds.add(uid);
    });

    // 2. Si hay IDs faltantes, consultarlos
    if (missingUserIds.size > 0) {
      for (const uid of missingUserIds) {

        // --- CORRECCIÓN APLICADA AQUÍ ---
        const tryPaths = [
          `/users/${uid}`, // <--- 1. Ruta correcta (Laravel standard)
          `/users/${uid}?include=persona`, // 2. Con datos de persona
          `/usuarios/${uid}`, // 3. Fallback (por si acaso)
          `/user/${uid}` // 4. Fallback
        ];

        let found = false;
        for (const p of tryPaths) {
          try {
            const r = await apiGet(p);
            if (!r) continue;

            const userObj = r.data || r;
            if (userObj && (userObj.id || userObj.user_id)) {
              const name = userObj.name || userObj.nombre || userObj.email || `Usuario #${uid}`;
              usuarioMap.set(Number(uid), name);
              found = true;
              break; // ¡Encontrado! Dejar de intentar otras rutas
            }
          } catch (err) {
            // Silenciar error 404 en consola si falla este intento
          }
        }

        // Si fallaron todas las rutas, poner nombre por defecto
        if (!found) {
          usuarioMap.set(Number(uid), `Usuario #${uid}`);
        }
      }
    }
  } catch (e) {
    console.debug('loadAsignaciones: error fetching users by id', e);
  }

  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Vehículo</th><th>Ruta</th><th>Kilometraje</th><th>Fecha/Hora</th><th>Usuario</th><th>Acciones</th>';
  html += '</tr></thead><tbody>';

  asignaciones.forEach(a => {
    // resolver placa
    let placa = 'N/A';
    if (a.vehiculo && a.vehiculo.placa) placa = a.vehiculo.placa;
    else if (a.vehiculo && a.vehiculo.id && vehiculoMap.has(a.vehiculo.id)) placa = vehiculoMap.get(a.vehiculo.id);
    else if (a.vehiculo_id && vehiculoMap.has(a.vehiculo_id)) placa = vehiculoMap.get(a.vehiculo_id);
    else if (typeof a.vehiculo === 'number' && vehiculoMap.has(a.vehiculo)) placa = vehiculoMap.get(a.vehiculo);

    // resolver ruta
    let rutaNombre = 'N/A';
    if (a.ruta && (a.ruta.nombre || a.ruta.name)) rutaNombre = a.ruta.nombre || a.ruta.name;
    else if (a.ruta_id && rutaMap.has(a.ruta_id)) rutaNombre = rutaMap.get(a.ruta_id);
    else if (a.ruta && a.ruta.id && rutaMap.has(a.ruta.id)) rutaNombre = rutaMap.get(a.ruta.id);
    else if (typeof a.ruta === 'number' && rutaMap.has(a.ruta)) rutaNombre = rutaMap.get(a.ruta);

    // resolver usuario
    let usuarioNombre = 'N/A';
    if (a.usuario && (a.usuario.name || a.usuario.nombre)) usuarioNombre = a.usuario.name || a.usuario.nombre;
    else if (a.usuario_id && usuarioMap.has(a.usuario_id)) usuarioNombre = usuarioMap.get(a.usuario_id);
    else if (a.usuario && a.usuario.id && usuarioMap.has(a.usuario.id)) usuarioNombre = usuarioMap.get(a.usuario.id);

    html += `<tr>\n            <td>${placa || 'N/A'}</td>\n            <td>${rutaNombre || 'N/A'}</td>\n            <td>${a.kilometraje || 'N/A'}</td>\n            <td>${a.fecha_hora || 'N/A'}</td>\n            <td>${usuarioNombre || 'N/A'}</td>\n            <td>\n                <button class="btn-delete" onclick="deleteAsignacion(${a.id})">Eliminar</button>\n            </td>\n        </tr>`;
  });

  html += '</tbody></table>';
  document.getElementById('asignaciones-table').innerHTML = html;
}

// Eliminar asignación
window.deleteAsignacion = async function (id) {
  showConfirm(
    'Eliminar Asignación'
    , '¿Estás seguro que deseas eliminar esta asignación?'
    , async () => {
      const result = await apiDelete(`/seguim-estado-veh/${id}`);
      if (result) {
        showNotification('success', '¡Éxito!', 'Asignación eliminada');
        loadAsignaciones();
      }
    }
  );
};

// Resolver usuario actual (intenta cache local, luego endpoints comunes)
async function resolveCurrentUser() {
  const possibleKeys = ['auth_user', 'authUser', 'user', 'usuario'];
  for (const k of possibleKeys) {
    const raw = sessionStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      if (obj && (obj.id || obj.name || obj.nombre)) return obj;
    } catch (e) { }
  }

  const token = getToken();
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && (payload.sub || payload.id || payload.user_id)) {
      return { id: payload.sub || payload.id || payload.user_id, name: payload.name || payload.nombre || null };
    }
  }

  const candidatePaths = ['/user', '/me', '/auth/user', '/auth/me', '/users/me'];
  for (const p of candidatePaths) {
    try {
      const r = await apiGet(p);
      if (!r) continue;
      const userObj = r.data || r;
      if (userObj && (userObj.id || userObj.user_id)) return userObj;
    } catch (e) { }
  }
  return null;
}

// Abrir modal para agregar asignación
async function openModalAsignacion() {
  document.getElementById('form-asignacion').reset();

  // Cargar vehículos
  const vehiculos = await apiGet('/vehiculos');
  const selectVeh = document.getElementById('asignacion-vehiculo');
  selectVeh.innerHTML = '<option value="">Seleccione</option>';
  normalizeList(vehiculos).forEach(v => {
    selectVeh.innerHTML += `<option value="${v.id}">${v.placa}</option>`;
  });

  // Cargar rutas
  const rutas = await apiGet('/rutas');
  const selectRuta = document.getElementById('asignacion-ruta');
  selectRuta.innerHTML = '<option value="">Seleccione</option>';
  normalizeList(rutas).forEach(r => {
    const label = r.nombre || r.name || `Ruta #${r.id}`;
    selectRuta.innerHTML += `<option value="${r.id}">${label}</option>`;
  });

  // Fecha/hora por defecto
  const now = new Date();
  document.getElementById('asignacion-fecha').value = now.toISOString().split('T')[0];
  document.getElementById('asignacion-hora').value = now.toTimeString().slice(0, 5);

  // Mostrar usuario actual
  try {
    const user = await resolveCurrentUser();
    const infoEl = document.getElementById('asignacion-usuario-info');
    if (infoEl && user && (user.name || user.nombre || user.email || user.id)) {
      infoEl.textContent = `Asignando como: ${user.name || user.nombre || user.email || 'ID ' + user.id}`;
      infoEl.style.display = 'block';
    }
  } catch (e) { }

  document.getElementById('modal-asignacion').style.display = 'flex';
}

// Guardar asignación
async function saveAsignacion(e) {
  e.preventDefault();

  let resolvedUserId = getUserId();

  if (!resolvedUserId) {
    showNotification('info', 'Obteniendo usuario', 'Intentando resolver usuario desde el servidor...');
    const candidatePaths = ['/user', '/me', '/auth/user', '/auth/me', '/users/me'];
    for (const p of candidatePaths) {
      try {
        const r = await apiGet(p);
        if (!r) continue;
        const userObj = r.data || r;
        if (userObj && (userObj.id || userObj.user_id || userObj.sub)) {
          resolvedUserId = parseInt(userObj.id || userObj.user_id || userObj.sub, 10);
          if (!isNaN(resolvedUserId)) break;
        }
      } catch (err) { }
    }
  }

  if (!resolvedUserId) {
    showNotification('error', 'Error', 'No se pudo obtener el ID del usuario. Abre la consola (F12) para más detalles.');
    return;
  }

  const asignacionData = {
    vehiculo_id: document.getElementById('asignacion-vehiculo').value
    , ruta_id: document.getElementById('asignacion-ruta').value
    , usuario_id: resolvedUserId
    , kilometraje: document.getElementById('asignacion-kilometraje').value || null
    , fecha_hora: document.getElementById('asignacion-fecha').value
      ? document.getElementById('asignacion-fecha').value + ' ' + (document.getElementById('asignacion-hora').value || '00:00:00')
      : null
    , observaciones: document.getElementById('asignacion-observaciones').value || null
  };

  const result = await apiPost('/seguim-estado-veh', asignacionData);
  if (result) {
    showNotification('success', '¡Éxito!', 'Asignación creada exitosamente');
    document.getElementById('modal-asignacion').style.display = 'none';
    loadAsignaciones();
  }
}

// Exponer al scope global
window.loadAsignaciones = loadAsignaciones;
window.openModalAsignacion = openModalAsignacion;
window.saveAsignacion = saveAsignacion;
window.resolveCurrentUser = resolveCurrentUser;