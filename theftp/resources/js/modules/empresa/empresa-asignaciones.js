// ==========================
// 6. ASIGNACIONES VEH-RUTA (REFACTORIZADO)
// ==========================

window.asignacionesCurrentPage = 1;
window.asignacionesLastPage = 1;
window.asignacionesLimit = 10;

async function loadAsignaciones(page = 1) {
  window.asignacionesCurrentPage = page;
  const container = document.getElementById('asignaciones-table');
  const paginationDiv = document.getElementById('asignaciones-pagination');

  if (!container) return;

  container.innerHTML = '<div class="loading-state" style="padding:2rem; text-align:center; color:#666;"><p>Buscando asignaciones...</p></div>';

  let endpoint = `/seguim-estado-veh?include=vehiculo,ruta,usuario,conductor.persona&limit=${window.asignacionesLimit}&page=${page}`;

  // Construcción de Filtros
  let filtros = [];
  const vehiculoId = document.getElementById('filter-asig-vehiculo')?.value;
  const conductorId = document.getElementById('filter-asig-conductor')?.value;
  const rutaId = document.getElementById('filter-asig-ruta')?.value;
  const fecha = document.getElementById('filter-asig-fecha')?.value;

  if (vehiculoId) filtros.push({ "column": "vehiculo_id", "operator": "=", "value": vehiculoId });
  if (conductorId) filtros.push({ "column": "conductor_id", "operator": "=", "value": conductorId });
  if (rutaId) filtros.push({ "column": "ruta_id", "operator": "=", "value": rutaId });
  if (fecha) {
    filtros.push({ "column": "fecha_hora", "operator": ">=", "value": fecha + ' 00:00:00' });
    filtros.push({ "column": "fecha_hora", "operator": "<=", "value": fecha + ' 23:59:59' });
  }

  const filtroJson = encodeURIComponent(JSON.stringify(filtros));
  endpoint += `&filter=${filtroJson}&orderBy=fecha_hora&orderDirection=desc`;

  try {
    const res = await apiGet(endpoint);
    const docs = normalizeList(res);

    const meta = res.data?.meta || res.data || {};
    window.asignacionesLastPage = meta.last_page || Math.ceil((res.total || 0) / window.asignacionesLimit) || 1;

    if (docs.length === 0) {
      container.innerHTML = '<div style="padding:3rem; text-align:center; background:#f9fafb; border-radius:8px; color:#6b7280;"><p>No se encontraron asignaciones con los filtros aplicados.</p></div>';
      if (paginationDiv) paginationDiv.style.display = 'none';
      setupAsignacionesFilters(); // Asegurar poblado de filtros aunque no haya datos
      return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Ruta</th>
                <th>Kilometraje</th>
                <th>Fecha/Hora</th>
                <th>Usuario</th>
                <th>Gestión</th>
            </tr>
        </thead>
        <tbody>`;

    docs.forEach((a, index) => {
      const rowNum = ((page - 1) * window.asignacionesLimit) + index + 1;
      const placa = a.vehiculo?.placa || 'N/A';
      const rutaNombre = a.ruta?.nombre || a.ruta?.name || 'N/A';
      const usuarioNombre = a.usuario?.name || a.usuario?.nombre || 'N/A';

      let conductorNombre = 'N/A';
      if (a.conductor && a.conductor.persona) {
        const p = a.conductor.persona;
        conductorNombre = `${p.name || ''} ${p.last_name || ''}`.trim();
      }

      const formatDateTime = (dt) => dt ? String(dt).substring(0, 16).replace('T', ' ') : 'N/A';
      let timeStr = formatDateTime(a.fecha_hora);
      if (a.fecha_hora_fin) {
        timeStr += `<div style="font-size:0.75rem; color:#6b7280; font-style:italic;">hasta ${formatDateTime(a.fecha_hora_fin)}</div>`;
      }

      html += `<tr style="border-bottom:1px solid #f3f4f6;">
              <td style="color:#6b7280;">${rowNum}</td>
              <td style="font-weight:600;">${placa}</td>
              <td>${conductorNombre}</td>
              <td><span style="background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:0.8rem;">${rutaNombre}</span></td>
              <td>${a.kilometraje || '-'} km</td>
              <td>${timeStr}</td>
              <td style="font-size:0.8rem; color:#4b5563;">${usuarioNombre}</td>
              <td>
                  <div style="display:flex; gap:0.5rem; align-items:center;">
                    <button class="btn-edit btn-sm" onclick="editAsignacion(${a.id})" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:14px; height:14px;">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13.5 6.5l4 4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-delete btn-sm" onclick="openModalAnular(${a.id})" title="Anular Despacho">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                        Anular
                    </button>
                  </div>
              </td>
          </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    if (paginationDiv) {
      paginationDiv.style.display = 'flex';
      const from = meta.from || ((page - 1) * window.asignacionesLimit + 1);
      const to = meta.to || (from + docs.length - 1);
      const total = res.total || meta.total || 0;
      document.getElementById('asig-pagi-info').textContent = `${from} - ${to} de ${total}`;
      document.getElementById('btn-asig-prev').disabled = (page <= 1);
      document.getElementById('btn-asig-next').disabled = (page >= window.asignacionesLastPage);
    }

    setupAsignacionesFilters();

  } catch (error) {
    console.error("Error loading assignments:", error);
    container.innerHTML = '<div class="text-center p-8 text-red-500">Error al conectar con el servidor.</div>';
  }
}

// --- GESTIÓN (EDITAR / ANULAR) ---

window.editAsignacion = async function (id) {
  try {
    const res = await apiGet(`/seguim-estado-veh/${id}`);
    const data = res.data || res;
    if (!data) return;

    await openModalAsignacion();

    document.getElementById('modal-asignacion-title').textContent = 'Editar Asignación';
    document.getElementById('asignacion-id').value = data.id;
    document.getElementById('asignacion-vehiculo').value = data.vehiculo_id;
    document.getElementById('asignacion-conductor').value = data.conductor_id;
    document.getElementById('asignacion-ruta').value = data.ruta_id;
    document.getElementById('asignacion-kilometraje').value = data.kilometraje || '';
    document.getElementById('asignacion-observaciones').value = data.observaciones || '';

    if (data.fecha_hora) {
      const dt = data.fecha_hora.split(' ');
      document.getElementById('asignacion-fecha').value = dt[0];
      document.getElementById('asignacion-hora').value = dt[1].substring(0, 5);
    }
    if (data.fecha_hora_fin) {
      document.getElementById('asignacion-hora-fin').value = data.fecha_hora_fin.split(' ')[1].substring(0, 5);
    }

    document.getElementById('asignacion-vehiculo').dispatchEvent(new Event('change'));
    document.getElementById('asignacion-conductor').dispatchEvent(new Event('change'));

  } catch (e) {
    console.error("Error al cargar asignación:", e);
    showNotification('error', 'Error', 'No se pudieron cargar los datos.');
  }
};

window.openModalAnular = function (id) {
  document.getElementById('anular-asignacion-id').value = id;
  document.getElementById('anular-motivo').value = '';
  document.getElementById('modal-anular-asignacion').style.display = 'flex';
};

window.confirmAnular = async function () {
  const id = document.getElementById('anular-asignacion-id').value;
  const motivo = document.getElementById('anular-motivo').value.trim();
  if (!motivo) {
    showNotification('warning', 'Motivo Requerido', 'Debe indicar la razón de la anulación.');
    return;
  }
  try {
    const res = await apiGet(`/seguim-estado-veh/${id}`);
    const currentData = res.data || res;
    const oldObs = currentData.observaciones || '';
    const newObs = `[ANULADO: ${motivo}] ${oldObs}`.trim();
    await apiPut(`/seguim-estado-veh/${id}`, { observaciones: newObs });
    await apiDelete(`/seguim-estado-veh/${id}`);
    showNotification('success', 'Despacho Anulado', 'El servicio ha sido cancelado con éxito.');
    document.getElementById('modal-anular-asignacion').style.display = 'none';
    loadAsignaciones(window.asignacionesCurrentPage);
  } catch (e) {
    console.error("Error al anular:", e);
    showNotification('error', 'Error', 'No se pudo procesar la anulación.');
  }
};

// --- RESTO DE LÓGICA ---

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
  try {
    const r = await apiGet('/auth/me');
    const userObj = r?.data || r;
    if (userObj && userObj.id) {
      sessionStorage.setItem('auth_user', JSON.stringify(userObj));
      return userObj;
    }
  } catch (e) { }
  return null;
}

async function openModalAsignacion() {
  document.getElementById('form-asignacion').reset();
  const vehiculos = await apiGet('/vehiculos');
  const novedadesResp = await apiGet('/novedades-vehiculos');
  const selectVeh = document.getElementById('asignacion-vehiculo');
  selectVeh.innerHTML = '<option value="">Seleccione</option>';

  const allVehiculos = normalizeList(vehiculos);
  const allNovedades = normalizeList(novedadesResp);
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];

  const vList = allVehiculos.filter(v => {
    const isActivo = v.estado !== false && v.estado !== 0 && String(v.estado) !== '0';
    const isEnServicio = v.servicio === true || v.servicio === 1 || String(v.servicio) === '1';
    const soatVigente = v.fecha_vencimiento_soat && new Date(v.fecha_vencimiento_soat) > hoy;
    const tecnoVigente = v.fecha_vencimiento_tecno && new Date(v.fecha_vencimiento_tecno) > hoy;
    const tieneDocSoat = !!v.documento_soat_id;
    const tieneDocTecno = !!v.documento_tecno_id;
    const hasNoveltyNow = allNovedades.some(n => {
      if (n.vehiculo_id !== v.id || n.deleted_at) return false;
      return hoyStr >= n.fecha_inicio && hoyStr <= (n.fecha_fin || '9999-12-31');
    });
    return isActivo && isEnServicio && soatVigente && tecnoVigente && tieneDocSoat && tieneDocTecno && !hasNoveltyNow;
  });
  vList.forEach(v => { selectVeh.innerHTML += `<option value="${v.id}">${v.placa}</option>`; });

  const conductores = await apiGet('/conductores?include=persona');
  const selectCond = document.getElementById('asignacion-conductor');
  selectCond.innerHTML = '<option value="">Seleccione</option>';
  normalizeList(conductores).filter(c => c.estado !== false && c.estado !== 0).forEach(c => {
    const p = c.persona || {};
    selectCond.innerHTML += `<option value="${c.id}">${p.name || ''} ${p.last_name || ''}</option>`;
  });

  const rutas = await apiGet('/rutas');
  const selectRuta = document.getElementById('asignacion-ruta');
  if (selectRuta) {
    selectRuta.innerHTML = '<option value="">Seleccione</option>';
    normalizeList(rutas)
      .filter(r => r.estado !== false) // IMPORTANTE: Solo rutas activas para nuevas asignaciones
      .forEach(r => { 
        selectRuta.innerHTML += `<option value="${r.id}">${r.nombre || r.name}</option>`; 
      });
  }

  const now = new Date();
  document.getElementById('asignacion-fecha').value = now.toISOString().split('T')[0];
  document.getElementById('asignacion-hora').value = now.toTimeString().slice(0, 5);
  document.getElementById('asignacion-hora-fin').value = new Date(now.getTime() + 2 * 3600000).toTimeString().slice(0, 5);

  document.getElementById('modal-asignacion').style.display = 'flex';
}

async function checkDuplicateAsignacion(vehiculoId, conductorId, startStr, endStr) {
  const currentId = document.getElementById('asignacion-id').value;
  try {
    const ns = new Date(startStr); const ne = new Date(endStr);
    const filterC = JSON.stringify([{ column: 'conductor_id', operator: '=', value: conductorId }]);
    const respC = await apiGet(`/seguim-estado-veh?filter=${encodeURIComponent(filterC)}`);
    for (let d of normalizeList(respC)) {
      if (String(d.id) === String(currentId)) continue;
      if (ns < new Date(d.fecha_hora_fin) && ne > new Date(d.fecha_hora)) return { error: 'Conductor ocupado.' };
    }
    return null;
  } catch (e) { return null; }
}

async function saveAsignacion(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    const user = await resolveCurrentUser(); if (!user) return;
    const v = document.getElementById('asignacion-vehiculo').value;
    const c = document.getElementById('asignacion-conductor').value;
    const f = document.getElementById('asignacion-fecha').value;
    const h = document.getElementById('asignacion-hora').value;
    const hf = document.getElementById('asignacion-hora-fin').value;
    const data = {
      vehiculo_id: v, conductor_id: c, ruta_id: document.getElementById('asignacion-ruta').value,
      usuario_id: user.id, kilometraje: document.getElementById('asignacion-kilometraje').value,
      fecha_hora: `${f} ${h}`, fecha_hora_fin: `${f} ${hf}`,
      observaciones: document.getElementById('asignacion-observaciones').value
    };
    const id = document.getElementById('asignacion-id').value;
    const res = id ? await apiPut(`/seguim-estado-veh/${id}`, data) : await apiPost('/seguim-estado-veh', data);
    if (res) {
      showNotification('success', '¡Éxito!', 'Guardado');
      document.getElementById('modal-asignacion').style.display = 'none';
      loadAsignaciones();
    }
  } finally { if (btn) btn.disabled = false; }
}

async function setupAsignacionesFilters() {
  const sv = document.getElementById('filter-asig-vehiculo');
  if (!sv || sv.options.length > 1) return;
  const [vR, cR, rR] = await Promise.all([apiGet('/vehiculos'), apiGet('/conductores?include=persona'), apiGet('/rutas')]);
  normalizeList(vR).forEach(v => { sv.innerHTML += `<option value="${v.id}">${v.placa}</option>`; });
  normalizeList(cR).forEach(c => { document.getElementById('filter-asig-conductor').innerHTML += `<option value="${c.id}">${c.persona?.name || ''}</option>`; });
  
  const sr = document.getElementById('filter-asig-ruta');
  if (sr) {
    normalizeList(rR).forEach(r => { 
      const label = r.estado === false ? `[INACTIVA] ${r.nombre || r.name}` : (r.nombre || r.name);
      sr.innerHTML += `<option value="${r.id}">${label}</option>`; 
    });
  }
}

window.handleAsignacionesSearch = () => loadAsignaciones(1);
window.clearAsignacionesSearch = () => {
  ['filter-asig-vehiculo', 'filter-asig-conductor', 'filter-asig-ruta', 'filter-asig-fecha'].forEach(id => document.getElementById(id).value = '');
  loadAsignaciones(1);
};
window.changeAsignacionesPage = (dir) => {
  let p = window.asignacionesCurrentPage; loadAsignaciones(dir === 'next' ? p + 1 : p - 1);
};

window.loadAsignaciones = loadAsignaciones;
window.openModalAsignacion = async function () {
  document.getElementById('asignacion-id').value = '';
  document.getElementById('modal-asignacion-title').textContent = 'Nueva Asignación';
  await openModalAsignacion();
};
window.saveAsignacion = saveAsignacion;
window.confirmAnular = confirmAnular;
window.editAsignacion = editAsignacion;
window.openModalAnular = openModalAnular;