// --- INFORMES ---
let informeConductoresCache = {
  conductores: []
  , licencias: []
};
let licenciasDetallesMap = new Map(); // licencia_id -> detalle completo
let informeVehiculosRutaCache = {
  asignaciones: []
};
let informeAvailableFields = {
  numero: false
  , fecha: false
  , categoria: false
};
let informeRestriccionesMap = new Map();
let informeDocumentosMap = new Map();

function exportCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const csvContent = rows.map(r => r.map(v => '"' + (v ?? '') + '"').join(',')).join('\n');
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildResumenConductores() {
  const {
    conductores
    , licencias
  } = informeConductoresCache;
  const totalConductores = conductores.length;
  const licenciasPorConductor = new Map();
  licencias.forEach(l => {
    const cid = (l.conductor_id ?? l.conductorId ?? l.conductor?.id);
    const arr = licenciasPorConductor.get(cid) || [];
    arr.push(l);
    licenciasPorConductor.set(cid, arr);
  });
  let conLicencia = 0
    , sinLicencia = 0
    , vigentes = 0
    , vencidas = 0;
  const hoy = new Date();
  conductores.forEach(c => {
    const lista = licenciasPorConductor.get(c.id) || [];
    if (lista.length === 0) {
      sinLicencia++;
    } else {
      conLicencia++;
      lista.forEach(l => {
        const lic = l.licencia || l || {};
        const fecha = extractFechaVencimiento(lic);
        if (!fecha) return; // sin fecha no suma a vigentes/vencidas
        if (fecha < hoy) vencidas++;
        else vigentes++;
      });
    }
  });
  return {
    totalConductores
    , conLicencia
    , sinLicencia
    , vigentes
    , vencidas
  };
}
// Extrae numero y fecha de vencimiento buscando múltiples variantes de nombres
function extractNumeroLicencia(lic) {
  if (!lic || typeof lic !== 'object') return '—';
  // Buscar primero en el propio objeto
  const direct = lic.numero || lic.num_licencia || lic.numero_licencia || lic.nro || lic.num || lic.licencia_numero;
  if (direct) return direct;
  // Luego intentar catálogo
  const detalle = licenciasDetallesMap.get(lic.id || lic.licencia_id);
  if (detalle) {
    const detNum = detalle.numero || detalle.num_licencia || detalle.numero_licencia || detalle.nro || detalle.num || detalle.licencia_numero;
    if (detNum) return detNum;
  }
  // Como fallback mostrar id para tener algo visible
  const fallbackId = lic.licencia_id || lic.id;
  if (fallbackId) return fallbackId;
  // Búsqueda flexible
  for (const k of Object.keys(lic)) {
    const lower = k.toLowerCase();
    if (lower.includes('lic') && (lower.includes('num') || lower.includes('nro'))) {
      const val = lic[k];
      if (val) return val;
    }
    if ((lower === 'numero' || lower === 'num')) {
      const val = lic[k];
      if (val) return val;
    }
  }
  // Búsqueda profunda (documento, restriccion, etc.)
  const deep = deepSearch(lic, (key, val) => {
    if (val && typeof val === 'string') {
      const lk = key.toLowerCase();
      if ((lk.includes('lic') && (lk.includes('num') || lk.includes('nro'))) || lk === 'numero' || lk === 'num') return true;
    }
    return false;
  });
  if (deep) return deep;
  return '—';
}

function extractFechaVencimiento(lic) {
  if (!lic || typeof lic !== 'object') return null;
  const raw = lic.fecha_vencimiento || lic.vencimiento || lic.fecha_venc || lic.fec_venc || lic.expira || lic.expiracion;
  if (raw) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  // Intentar catálogo
  const detalle = licenciasDetallesMap.get(lic.id || lic.licencia_id);
  if (detalle) {
    const rawDet = detalle.fecha_vencimiento || detalle.vencimiento || detalle.fecha_venc || detalle.fec_venc || detalle.expira || detalle.expiracion;
    if (rawDet) {
      const d = new Date(rawDet);
      if (!isNaN(d.getTime())) return d;
    }
  }
  for (const k of Object.keys(lic)) {
    const lower = k.toLowerCase();
    if (lower.includes('venc') || lower.includes('expir')) {
      const val = lic[k];
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // Búsqueda profunda
  const deepDateStr = deepSearch(lic, (key, val) => {
    if (!val) return false;
    if (typeof val !== 'string') return false;
    const lk = key.toLowerCase();
    if (lk.includes('venc') || lk.includes('expir')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return true;
    }
    return false;
  });
  if (deepDateStr) {
    const d = new Date(deepDateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
// Búsqueda recursiva limitada para encontrar valores que cumplen un predicado
function deepSearch(obj, predicate, depth = 0, maxDepth = 4) {
  if (!obj || typeof obj !== 'object' || depth > maxDepth) return null;
  for (const [k, v] of Object.entries(obj)) {
    try {
      if (predicate(k, v)) return v;
    } catch (e) {
      /* ignorar */
    }
    if (v && typeof v === 'object') {
      const found = deepSearch(v, predicate, depth + 1, maxDepth);
      if (found) return found;
    }
  }
  return null;
}

function extractFechaVencimientoStr(lic) {
  const d = extractFechaVencimiento(lic);
  if (!d) return '—';
  // Formato AAAA-MM-DD
  return d.toISOString().slice(0, 10);
}

// Extrae fecha de expedición (si existe) buscando variantes comunes
function extractFechaExpedicion(lic) {
  if (!lic || typeof lic !== 'object') return null;
  const raw = lic.fecha_expedicion || lic.fecha_exped || lic.expedicion || lic.fecha_expe || lic.fecha_expedicion;
  if (raw) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  // Intentar catálogo
  const detalle = licenciasDetallesMap.get(lic.id || lic.licencia_id);
  if (detalle) {
    const rawDet = detalle.fecha_expedicion || detalle.fecha_exped || detalle.expedicion || detalle.fecha_expe;
    if (rawDet) {
      const d = new Date(rawDet);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // Búsqueda por claves que contengan 'exped'
  for (const k of Object.keys(lic)) {
    const lower = k.toLowerCase();
    if (lower.includes('exped')) {
      const val = lic[k];
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const deepDateStr = deepSearch(lic, (key, val) => {
    if (!val) return false;
    if (typeof val !== 'string') return false;
    const lk = key.toLowerCase();
    if (lk.includes('exped')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return true;
    }
    return false;
  });
  if (deepDateStr) {
    const d = new Date(deepDateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function extractFechaExpedicionStr(lic) {
  const d = extractFechaExpedicion(lic);
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

// Resolver detalle (restricción, documento, fecha) disponible globalmente
function resolveDetalleInfo(maybeLicObj, wrapperObj) {
  const result = {
    restrText: ''
    , docText: ''
    , fechaExp: '—'
  };
  if (!maybeLicObj && !wrapperObj) return result;

  let detKey = (maybeLicObj && (maybeLicObj.id || maybeLicObj.licencia_id)) || (wrapperObj && (wrapperObj.licencia_id || wrapperObj.id));
  let det = null;
  if (detKey !== undefined && detKey !== null) {
    det = licenciasDetallesMap.get(detKey) || licenciasDetallesMap.get(String(detKey)) || licenciasDetallesMap.get(Number(detKey));
  }
  if (!det && maybeLicObj && maybeLicObj.licencia) det = maybeLicObj.licencia;
  if (!det) det = maybeLicObj || wrapperObj || {};

  // Restricción
  const restrId = det.restriccion_lic_id || det.restriccion_id || (det.restriccion && (det.restriccion.id || det.restriccion.restriccion_lic_id)) || maybeLicObj?.restriccion_lic_id || wrapperObj?.restriccion_lic_id;
  if (restrId !== undefined && restrId !== null) {
    const restrObj = informeRestriccionesMap.get(restrId) || informeRestriccionesMap.get(String(restrId)) || informeRestriccionesMap.get(Number(restrId));
    if (restrObj) result.restrText = (typeof restrObj === 'string') ? restrObj : (restrObj.descripcion || restrObj.nombre || restrObj.descripcion_corta || String(restrObj.id));
    else result.restrText = String(restrId);
  }

  // Documento
  const docId = det.documento_id || det.documentoId || det.documento || maybeLicObj?.documento_id || wrapperObj?.documento_id;
  if (docId !== undefined && docId !== null) {
    let docObj = informeDocumentosMap.get(docId) || informeDocumentosMap.get(String(docId)) || informeDocumentosMap.get(Number(docId));
    if (!docObj && typeof docId === 'object') docObj = docId;
    if (docObj) result.docText = (docObj.nombre || docObj.descripcion || docObj.titulo || (docObj.numero || docObj.nro || docObj.numero_documento) || String(docObj.id));
    else result.docText = String(docId);
  }

  // Fecha expedición
  result.fechaExp = extractFechaExpedicionStr(det);
  if (result.fechaExp === '—') result.fechaExp = extractFechaExpedicionStr(maybeLicObj);
  if (result.fechaExp === '—' && wrapperObj) result.fechaExp = extractFechaExpedicionStr(wrapperObj);

  return result;
}

function renderTablaConductores(filtroCategoria = 'todas') {
  const {
    conductores
    , licencias
  } = informeConductoresCache;
  const cols = ['Conductor', 'Identificación'];
  const colKeys = ['conductor', 'identificacion'];
  // Decidir columna de licencia: mostrar número si existe, sino mostrar ID
  if (informeAvailableFields.numero) {
    cols.push('Licencia Nº');
    colKeys.push('numero');
  } else if (informeAvailableFields.restriccion) {
    cols.push('Restricción');
    colKeys.push('restriccion');
  } else if (informeAvailableFields.documento) {
    cols.push('Documento');
    colKeys.push('documento');
  } else {
    cols.push('Licencia ID');
    colKeys.push('licencia_id');
  }
  if (informeAvailableFields.categoria) {
    cols.push('Categoría');
    colKeys.push('categoria');
  }
  if (informeAvailableFields.expedicion) {
    cols.push('Fecha Expedición');
    colKeys.push('fecha_expedicion');
  }
  // Construir header
  let html = '<table class="data-table"><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
  let added = 0;
  conductores.forEach(c => {
    const persona = c.persona || {};
    const firstName = (persona.name || persona.nombres || persona.nombre || '').trim();
    const lastName = (persona.last_name || persona.apellidos || persona.apellido || '').trim();
    const fullName = `${firstName || '—'} ${lastName || ''}`.trim();
    const idDisplay = persona.nui || persona.identificacion || persona.documento || persona.cc || persona.cedula || '—';
    const licCond = licencias.filter(l => (l.conductor_id ?? l.conductorId ?? l.conductor?.id) == c.id);
    if (licCond.length === 0) {
      html += `<tr class="row-sin"><td>${fullName}</td><td>${idDisplay}</td><td colspan="${cols.length - 2}" class="text-center"><span class="badge badge-error">Sin licencia</span></td></tr>`;
      added++;
    } else {
      licCond.forEach(l => {
        const lic = l.licencia || l || {};
        const numeroLic = extractNumeroLicencia(lic);
        const categoriaObj = lic.categoria || lic.categoria_licencia;
        const categoria = (categoriaObj?.descripcion || categoriaObj?.nombre || categoriaObj?.codigo || lic.categoria || lic.categoria_licencia) || '—';

        // Resolver restricción, documento y fecha de expedición desde el catálogo si está disponible
        const info = resolveDetalleInfo(lic, l);
        const restriccionText = info.restrText;
        const documentoText = info.docText;
        const fechaExpStr = info.fechaExp;

        if (filtroCategoria !== 'todas' && informeAvailableFields.categoria && filtroCategoria !== categoria) return;
        // Construir fila según columnas detectadas
        let row = `<td>${fullName}</td><td>${idDisplay}</td>`;
        if (informeAvailableFields.numero) row += `<td>${numeroLic}</td>`;
        else if (informeAvailableFields.restriccion) row += `<td>${restriccionText || '—'}</td>`;
        else if (informeAvailableFields.documento) row += `<td>${documentoText || '—'}</td>`;
        else row += `<td>${lic.licencia_id || lic.id || '—'}</td>`;
        if (informeAvailableFields.categoria) row += `<td>${categoria}</td>`;
        if (informeAvailableFields.expedicion) row += `<td>${fechaExpStr}</td>`;
        html += `<tr>${row}</tr>`;
        added++;
      });
    }
  });
  if (added === 0) html += `<tr><td colspan="${cols.length}" class="text-center" style="font-weight:600; color:#64748b;">No hay registros (verifica filtros o que existan conductores)</td></tr>`;
  html += '</tbody></table>';
  return html;
}

async function loadInformeConductores() {
  // Incluir persona para nombres/documentos; intentar incluir categoría en licencias si la API lo soporta
  const conductoresResp = await apiGet('/conductores?include=persona');
  const licenciasResp = await apiGet('/conductores-licencias?include=licencia.categoria');
  // Nuevo: traer catálogo de licencias completo para intentar extraer numero y fecha reales
  const licenciasCatalogResp = await apiGet('/licencias?include=categoria,restriccion,documento');

  // Normalización flexible para distintos formatos de respuesta
  const normalizeList = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data; // Laravel Resource
    if (resp.data && Array.isArray(resp.data.data)) return resp.data.data; // Paginación
    // Buscar primera propiedad que sea array
    for (const k of Object.keys(resp)) {
      if (Array.isArray(resp[k])) return resp[k];
    }
    return [];
  };

  const conductoresList = normalizeList(conductoresResp);
  const licenciasList = normalizeList(licenciasResp);
  const licenciasCatalogList = normalizeList(licenciasCatalogResp);

  // Cargar restricciones y documentos para mostrar información más relevante en el informe
  let restriccionesResp = null
    , documentosResp = null;
  try {
    restriccionesResp = await apiGet('/restriccion_lic');
  } catch (e) {
    /* ignore */
  }
  try {
    documentosResp = await apiGet('/documentos');
  } catch (e) {
    /* ignore */
  }
  const restriccionesList = normalizeList(restriccionesResp);
  const documentosList = normalizeList(documentosResp);
  // Rellenar mapas globales para que los helpers globales puedan acceder a ellos
  informeRestriccionesMap.clear();
  informeDocumentosMap.clear();
  restriccionesList.forEach(r => {
    if (r && (r.id || r.restriccion_lic_id)) informeRestriccionesMap.set(r.id || r.restriccion_lic_id, r);
  });
  documentosList.forEach(d => {
    if (d && (d.id || d.documento_id)) informeDocumentosMap.set(d.id || d.documento_id, d);
  });

  // Intentar obtener catálogo de categorías directamente desde el API
  let categoriasResp = null;
  try {
    categoriasResp = await apiGet('/categorias_licencia');
  } catch (e) {
    /* no fatal */
  }
  const categoriasListFromApi = normalizeList(categoriasResp);

  informeConductoresCache.conductores = conductoresList;
  informeConductoresCache.licencias = licenciasList;
  licenciasDetallesMap.clear();
  licenciasCatalogList.forEach(det => {
    if (det && (det.id || det.licencia_id)) {
      const key = det.id || det.licencia_id;
      licenciasDetallesMap.set(key, det);
    }
  });

  // Detectar qué campos están realmente presentes en la API
  (function detectAvailable() {
    let hasNum = false
      , hasDate = false
      , hasCat = false;
    let hasRestr = false
      , hasDoc = false
      , hasExped = false;
    const scan = (o) => {
      if (!o || typeof o !== 'object') return;
      const keys = Object.keys(o).map(k => k.toLowerCase());
      if (keys.some(k => k.includes('num') || k.includes('numero') || k.includes('nro'))) hasNum = true;
      if (keys.some(k => k.includes('venc') || k.includes('expir') || k.includes('fecha'))) hasDate = true;
      if (keys.some(k => k.includes('categoria') || k.includes('cat') || k === 'codigo' || k === 'descripcion')) hasCat = true;
      if (o.categoria || o.categoria_licencia) hasCat = true;
      if (keys.some(k => k.includes('restric') || k.includes('restriccion'))) hasRestr = true;
      if (keys.some(k => k.includes('document') || k.includes('documento') || k.includes('doc'))) hasDoc = true;
      if (keys.some(k => k.includes('exped') || k.includes('fecha_exped') || k.includes('fecha_expedicion'))) hasExped = true;
    };
    for (const it of licenciasCatalogList) {
      scan(it);
      if (hasNum && hasDate && hasCat) break;
    }
    if (!(hasNum && hasDate && hasCat))
      for (const it of licenciasList) {
        scan(it);
        if (hasNum && hasDate && hasCat) break;
      }
    informeAvailableFields.numero = hasNum;
    informeAvailableFields.fecha = hasDate;
    informeAvailableFields.categoria = hasCat;
    informeAvailableFields.restriccion = hasRestr || (restriccionesList && restriccionesList.length > 0);
    informeAvailableFields.documento = hasDoc || (documentosList && documentosList.length > 0);
    informeAvailableFields.expedicion = hasExped;
    console.log('[DEBUG informe conductores] availableFields:', informeAvailableFields);
  })();

  console.log('[DEBUG informe conductores] rawConductores:', conductoresResp);
  console.log('[DEBUG informe conductores] rawLicencias:', licenciasResp);
  console.log('[DEBUG informe conductores] rawLicenciasCatalog:', licenciasCatalogResp);
  console.log('[DEBUG informe conductores] normalized lengths:', {
    conductores: conductoresList.length
    , licencias: licenciasList.length
    , licenciasCatalog: licenciasCatalogList.length
  });

  // LOGGING TEMPORAL: Mostrar primeras entradas para depuración de categorías
  try {
    console.log('[DEBUG informe conductores] sample licenciasCatalogList (first 6):', (Array.isArray(licenciasCatalogList) ? licenciasCatalogList.slice(0, 6) : licenciasCatalogList));
    console.log('[DEBUG informe conductores] sample licenciasList (first 6):', (Array.isArray(licenciasList) ? licenciasList.slice(0, 6) : licenciasList));
    console.log('[DEBUG informe conductores] sample informeConductoresCache.licencias (first 6):', (Array.isArray(informeConductoresCache.licencias) ? informeConductoresCache.licencias.slice(0, 6) : informeConductoresCache.licencias));
  } catch (e) {
    console.warn('[DEBUG informe conductores] error printing samples', e);
  }

  // Si ambas respuestas son null probablemente 401 (ver consola). Mostrar mensaje amigable.
  if (!conductoresResp && !licenciasResp) {
    document.getElementById('informe-result').innerHTML = `
            <div class="informe-error auth-error" style="padding:1rem 1.25rem; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; color:#991b1b; font-size:.85rem; font-weight:500;">
                No se pudieron cargar los datos (401 Unauthorized). Inicia sesión nuevamente.
            </div>
        `;
    return; // abortar resto
  }

  const resumen = buildResumenConductores();
  // Obtener lista de categorías únicas (fuente preferida: /categorias_licencia)
  const categoriasSet = new Set();

  // Si la API devuelve el catálogo de categorías, usarlo primero (más fiable)
  if (Array.isArray(categoriasListFromApi) && categoriasListFromApi.length) {
    // Preferir mostrar la descripción/nombre de la categoría en lugar del código
    categoriasListFromApi.forEach(c => {
      if (!c) return;
      const label = (c.descripcion || c.nombre || c.codigo || c.name);
      if (label && typeof label === 'string' && label.trim()) {
        categoriasSet.add(label.trim());
        return;
      }
    });

    // Si no se detecta descripción, como fallback intentar extraer código o nombre
    if (categoriasSet.size === 0) {
      categoriasListFromApi.forEach(c => {
        const name = (c && (c.nombre || c.descripcion || c.codigo || c.name));
        if (name && typeof name === 'string' && name.trim()) categoriasSet.add(name.trim());
      });
      console.warn('[DEBUG categoria licencia] catálogo sin descripción, usando el primer campo disponible', categoriasListFromApi.slice(0, 6));
    }
  }

  // Helper: intenta extraer nombre de categoría desde distintos formatos
  const pushCategoriaFrom = (item, idx, sourceLabel) => {
    if (!item) return;
    // Normalizar a posible objeto 'licencia'
    const lic = item.licencia || item;

    // 1) buscar objetos categoría directos
    const candidates = [];
    if (lic.categoria) candidates.push(lic.categoria);
    if (lic.categoria_licencia) candidates.push(lic.categoria_licencia);

    // 2) propiedades directas que pueden contener el nombre
    ['nombre', 'codigo', 'descripcion', 'categoria', 'categoria_nombre', 'categoriaCodigo', 'categoria_codigo', 'categoria_descripcion', 'name'].forEach(k => {
      if (typeof lic[k] === 'string' && lic[k].trim()) candidates.push(lic[k].trim());
    });

    // 3) si existe un objeto 'categoria' dentro de objetos anidados
    if (lic.licencia && lic.licencia.categoria) candidates.push(lic.licencia.categoria);

    // Evaluar candidatos
    for (const c of candidates) {
      if (!c) continue;
      let name = '';
      if (typeof c === 'string') name = c;
      else if (typeof c === 'object') name = c.nombre || c.codigo || c.descripcion || c.name || c?.codigo || '';
      if (typeof name === 'string' && name.trim()) {
        categoriasSet.add(name.trim());
        return;
      }
    }

    // 4) fallback: búsqueda profunda en el objeto para encontrar cualquier string cuyo key incluya 'categoria'/'cat'/'codigo'/'descripcion'/'nombre'
    const found = deepSearch(lic, (k, v) => {
      if (!v) return false;
      if (typeof v !== 'string') return false;
      const lk = k.toLowerCase();
      if (lk.includes('categoria') || lk.includes('cat') || lk.includes('codigo') || lk.includes('descripcion') || lk === 'nombre' || lk === 'name') {
        return v.trim().length > 0;
      }
      return false;
    });
    if (found && typeof found === 'string' && found.trim()) categoriasSet.add(found.trim());

    // Debug para primeros registros
    if (idx < 3) {
      console.log('[DEBUG categoria licencia] source:', sourceLabel, 'registro', idx, {
        original: item
        , extracted: Array.from(categoriasSet).slice(-3)
      });
    }
  };

  // Revisar en varios lugares: licencias relacionadas, catálogo de licencias y la respuesta original de licencias
  try {
    if (Array.isArray(licenciasCatalogList)) licenciasCatalogList.forEach((it, i) => pushCategoriaFrom(it, i, 'catalog'));
  } catch (e) {
    /* ignore */
  }
  try {
    if (Array.isArray(licenciasList)) licenciasList.forEach((it, i) => pushCategoriaFrom(it, i, 'licenciasResp'));
  } catch (e) {
    /* ignore */
  }
  try {
    if (Array.isArray(informeConductoresCache.licencias)) informeConductoresCache.licencias.forEach((it, i) => pushCategoriaFrom(it, i, 'conductores_lic'));
  } catch (e) {
    /* ignore */
  }

  if (categoriasSet.size === 0) {
    console.warn('No se detectaron categorías de licencia. Revisa estructura de /conductores-licencias');
  }
  const categorias = Array.from(categoriasSet).sort();

  // Si detectamos menos categorías de las esperadas, intentar heurística: buscar strings que parezcan códigos de categoría (A, B, C, AB)
  if (categorias.length < 3) {
    const potentialSet = new Set();
    const collectPotentialCats = (obj) => {
      if (!obj) return;
      if (typeof obj === 'string') {
        const s = obj.trim();
        if (/^[A-Za-z]{1,3}$/.test(s)) potentialSet.add(s.toUpperCase());
        return;
      }
      if (Array.isArray(obj)) return obj.forEach(collectPotentialCats);
      if (typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
          try {
            collectPotentialCats(v);
          } catch (e) { }
        }
      }
    };
    try {
      if (Array.isArray(licenciasCatalogList)) licenciasCatalogList.forEach(collectPotentialCats);
    } catch (e) { }
    try {
      if (Array.isArray(licenciasList)) licenciasList.forEach(collectPotentialCats);
    } catch (e) { }
    try {
      if (Array.isArray(informeConductoresCache.licencias)) informeConductoresCache.licencias.forEach(collectPotentialCats);
    } catch (e) { }
    // añadir a set principal
    potentialSet.forEach(s => categoriasSet.add(s));
  }
  // recomponer array final ordenado
  const categoriasFinal = Array.from(categoriasSet).sort();
  // Filtrar códigos de una sola letra (A, B, C, etc.) para no mostrarlos en el select
  const categoriasFinalFiltered = categoriasFinal.filter(c => !/^[A-Za-z]$/.test(c));

  // Construir dinámicamente el HTML de controles según campos disponibles
  const resumenItems = [];
  resumenItems.push(`<div class="resumen-item resumen-item--total"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div><div class="resumen-text"><span>Total Conductores</span><strong>${resumen.totalConductores}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--lic"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19l12-12L19.6 5.6z"/></svg></div><div class="resumen-text"><span>Con Licencia</span><strong>${resumen.conLicencia}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--sin"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></div><div class="resumen-text"><span>Sin Licencia</span><strong>${resumen.sinLicencia}</strong></div></div>`);
  if (informeAvailableFields.fecha) {
    resumenItems.push(`<div class="resumen-item resumen-item--vig"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm1 12.59V6h-2v7l6.25 3.75 1-1.66L13 13.59z"/></svg></div><div class="resumen-text"><span>Licencias Vigentes</span><strong>${resumen.vigentes}</strong></div></div>`);
    resumenItems.push(`<div class="resumen-item resumen-item--ven"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div><div class="resumen-text"><span>Licencias Vencidas</span><strong>${resumen.vencidas}</strong></div></div>`);
  }

  const filtroEstadoHtml = informeAvailableFields.fecha ? `
            <div class="filtro-group">
                <label for='filtro-estado-lic' class='filtro-label'>Estado</label>
                <select id="filtro-estado-lic" class="filtro-select filtro-select--wide">
                    <option value="todos">Todos</option>
                    <option value="vigente">Vigente</option>
                    <option value="vencida">Vencida</option>
                    <option value="sin">Sin licencia</option>
                </select>
            </div>
    ` : '';

  let controls = `<div class="informe-controls">
        <div class="resumen-grid resumen-grid-enhanced">
            ${resumenItems.join('\n')}
        </div>
        <div class="filtros-grid filtros-grid-enhanced">
            ${filtroEstadoHtml}
            <div class="filtro-group">
                <label for='filtro-categoria-lic' class='filtro-label'>Categoría</label>
                <select id="filtro-categoria-lic" class="filtro-select filtro-select--wide">
                    <option value="todas">Todas</option>
                    ${categoriasFinalFiltered.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="export-buttons">
                <button id="btn-export-conductores" class="btn-export btn-export--primary"><svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M4 17.5C4 16.672 4.672 16 5.5 16h13c.828 0 1.5.672 1.5 1.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5Z'/><path d='M12 3v11'/><path d='M8 10.5l4 3.5 4-3.5'/></svg> Exportar CSV</button>
            </div>
        </div>
    </div>`;

  const tabla = `<div class="tabla-wrapper">${renderTablaConductores()}</div>`;
  const html = '<h3 class="informe-title">Informe: Conductores y Licencias</h3>' + controls + tabla;
  const cont = document.getElementById('informe-result');
  cont.innerHTML = html;

  // Solo filtrar por categoría si existe
  document.getElementById('filtro-categoria-lic').addEventListener('change', () => {
    const categoria = document.getElementById('filtro-categoria-lic').value;
    cont.querySelector('table').outerHTML = renderTablaConductores(categoria);
  });
  document.getElementById('btn-export-conductores').addEventListener('click', () => {
    const categoria = document.getElementById('filtro-categoria-lic').value;
    const rows = [];
    // Armar encabezado dinámico (preferir número, luego restricción, luego documento, luego id)
    const headers = ['Conductor', 'Identificación'];
    if (informeAvailableFields.numero) headers.push('Licencia Nº');
    else if (informeAvailableFields.restriccion) headers.push('Restricción');
    else if (informeAvailableFields.documento) headers.push('Documento');
    else headers.push('Licencia ID');
    if (informeAvailableFields.categoria) headers.push('Categoría');
    rows.push(headers);

    informeConductoresCache.conductores.forEach(c => {
      const persona = c.persona || {};
      const firstName = (persona.name || persona.nombres || persona.nombre || '').trim();
      const lastName = (persona.last_name || persona.apellidos || persona.apellido || '').trim();
      const fullName = `${firstName || '—'} ${lastName || ''}`.trim();
      const idDisplay = persona.nui || persona.identificacion || persona.documento || persona.cc || persona.cedula || '—';
      const licCond = informeConductoresCache.licencias.filter(l => (l.conductor_id ?? l.conductorId ?? l.conductor?.id) == c.id);
      if (licCond.length === 0) {
        const emptyRow = [fullName, idDisplay];
        while (emptyRow.length < headers.length) emptyRow.push('');
        rows.push(emptyRow);
      } else {
        licCond.forEach(l => {
          const lic = l.licencia || {};
          const numeroLic = extractNumeroLicencia(lic);
          const categoriaObj = lic.categoria || lic.categoria_licencia;
          const categoriaLic = (categoriaObj?.descripcion || categoriaObj?.nombre || categoriaObj?.codigo) || '';

          // obtener restricción/documento y fecha de expedición desde el catálogo si existe
          let restriccionText = '';
          let documentoText = '';
          let fechaExpStr = '';
          try {
            const detKey = lic.id || lic.licencia_id || l.licencia_id || l.id;
            const det = licenciasDetallesMap.get(detKey) || lic;
            if (det) {
              const restrId = det.restriccion_lic_id || det.restriccion_id;
              const restrObj = restriccionesMap.get(restrId);
              if (restrObj) {
                restriccionText = (typeof restrObj === 'string') ? restrObj : (restrObj.descripcion || restrObj.nombre || restrObj.descripcion_corta || String(restrObj.id));
              } else if (restrId) restriccionText = String(restrId);

              const docId = det.documento_id || det.documentoId || det.documento;
              if (docId) {
                const doc = documentosMap.get(docId);
                documentoText = doc ? (doc.nombre || doc.descripcion || doc.titulo || String(doc.id)) : String(docId);
              }

              fechaExpStr = extractFechaExpedicionStr(det);
              if (fechaExpStr === '—') fechaExpStr = extractFechaExpedicionStr(lic);
            }
          } catch (e) {
            /* ignore */
          }

          if ((categoria === 'todas' || !informeAvailableFields.categoria) || categoria === categoriaLic) {
            const row = [fullName, idDisplay];
            if (informeAvailableFields.numero) row.push(numeroLic === '—' ? '' : numeroLic);
            else if (informeAvailableFields.restriccion) row.push(restriccionText || '');
            else if (informeAvailableFields.documento) row.push(documentoText || '');
            else row.push(lic.licencia_id || lic.id || '');
            if (informeAvailableFields.categoria) row.push(categoriaLic);
            if (informeAvailableFields.expedicion) row.push(fechaExpStr || '—');
            rows.push(row);
          }
        });
      }
    });
    exportCSV('informe_conductores.csv', rows);
  });
}

function renderTablaVehiculosRutaDetalle(routeId = null) {
  const asignaciones = informeVehiculosRutaCache.asignaciones || [];
  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Ruta</th><th>Vehículo (Placa)</th><th>Tipo</th><th>Kilometraje</th><th>Fecha/Hora</th>';
  html += '</tr></thead><tbody>';
  const filtered = routeId ? asignaciones.filter(a => (a.ruta && (a.ruta.id == routeId || a.ruta.id === Number(routeId)))) : asignaciones;
  if (filtered.length === 0) {
    html += '<tr><td colspan="5" class="text-center">No hay asignaciones registradas</td></n></tr>';
  } else {
    filtered.forEach(a => {
      const vehiculo = a.vehiculo || {};
      const ruta = a.ruta || {};
      html += `<tr>
                <td>${ruta.nombre || 'N/A'}</td>
                <td>${vehiculo.placa || 'N/A'}</td>
                <td>${vehiculo.tipo?.nombre || 'N/A'}</td>
                <td>${a.kilometraje || 'N/A'}</td>
                <td>${a.fecha_hora || 'N/A'}</td>
            </tr>`;
    });
  }
  html += '</tbody></table>';
  return html;
}

async function loadInformeVehiculosRuta() {
  // Cargar asignaciones y recursos necesarios
  const asignacionesResp = await apiGet('/seguim-estado-veh');
  const rutasResp = await apiGet('/rutas');
  const vehiculosResp = await apiGet('/vehiculos');

  const asignacionesList = normalizeList(asignacionesResp);
  const rutasList = normalizeList(rutasResp);
  const vehiculosList = normalizeList(vehiculosResp);

  // Mapear objetos de vehículo/ruta a las asignaciones cuando la API devuelve solo IDs
  // Construir mapas rápidos por id (usar llave string para evitar mismatch entre "1" y 1)
  const vehiculoMap = new Map();
  if (Array.isArray(vehiculosList)) vehiculosList.forEach(v => {
    if (v && (v.id !== undefined && v.id !== null)) vehiculoMap.set(String(v.id), v);
  });
  const rutaMap = new Map();
  if (Array.isArray(rutasList)) rutasList.forEach(r => {
    if (r && (r.id !== undefined && r.id !== null)) rutaMap.set(String(r.id), r);
  });

  // Intentar cargar tipos de vehículo para mapear tipo_veh_id -> descripcion
  let tiposVehList = [];
  try {
    const tiposResp = await apiGet('/tipo-vehiculo');
    tiposVehList = normalizeList(tiposResp) || [];
  } catch (e) {
    console.debug('No se pudo cargar /tipo-vehiculo:', e);
  }
  const tipoMap = new Map();
  if (Array.isArray(tiposVehList)) tiposVehList.forEach(t => {
    if (t && (t.id !== undefined && t.id !== null)) tipoMap.set(String(t.id), t);
  });

  // Normalizar asignaciones: adjuntar `vehiculo` y `ruta` cuando falten y exista el id
  if (Array.isArray(asignacionesList)) {
    asignacionesList.forEach(a => {
      try {
        // Vehículo: soporte varios nombres de campo (vehiculo_id, vehiculoId, vehiculo)
        if ((!a.vehiculo || Object.keys(a.vehiculo).length === 0) && (a.vehiculo_id || a.vehiculoId)) {
          const vid = String(a.vehiculo_id || a.vehiculoId);
          if (vehiculoMap.has(vid)) a.vehiculo = Object.assign({}, vehiculoMap.get(vid));
        } else if (a.vehiculo && a.vehiculo.id) {
          const vid = String(a.vehiculo.id);
          if (vehiculoMap.has(vid)) a.vehiculo = Object.assign({}, vehiculoMap.get(vid), a.vehiculo);
        }

        // Si existe tipo id en el vehículo, mapear a objeto tipo con campo legible
        if (a.vehiculo) {
          // Normalizar nombre de placa
          if (!a.vehiculo.placa && (a.placa || a.vehiculo_placa)) {
            a.vehiculo.placa = a.placa || a.vehiculo_placa;
          }

          const tipoId = a.vehiculo.tipo_veh_id || a.vehiculo.tipoVehId || a.vehiculo.tipo_id || (a.vehiculo.tipo && a.vehiculo.tipo.id);
          if (!a.vehiculo.tipo && tipoId && tipoMap.has(String(tipoId))) {
            const tipoObj = tipoMap.get(String(tipoId));
            a.vehiculo.tipo = {
              nombre: tipoObj.descripcion || tipoObj.nombre || tipoObj.descripcion_corta || String(tipoObj.id)
            };
          }

          // Aceptar si el API devolvió 'tipo_vehiculo' anidado
          if (!a.vehiculo.tipo && a.vehiculo.tipo_vehiculo) {
            a.vehiculo.tipo = {
              nombre: a.vehiculo.tipo_vehiculo.descripcion || a.vehiculo.tipo_vehiculo.nombre
            };
          }
        }

        // Ruta: soporte ruta_id, rutaId, y objeto ruta
        if ((!a.ruta || Object.keys(a.ruta).length === 0) && (a.ruta_id || a.rutaId)) {
          const rid = String(a.ruta_id || a.rutaId);
          if (rutaMap.has(rid)) a.ruta = Object.assign({}, rutaMap.get(rid));
        } else if (a.ruta && a.ruta.id) {
          const rid = String(a.ruta.id);
          if (rutaMap.has(rid)) a.ruta = Object.assign({}, rutaMap.get(rid), a.ruta);
        }

        // Normalizar nombre de ruta (nombre vs name)
        if (a.ruta) {
          if (!a.ruta.nombre && a.ruta.name) a.ruta.nombre = a.ruta.name;
        }
      } catch (e) {
        // No bloquear si hay estructura inesperada
        console.debug('Normalizar asignación falló para item', a, e);
      }
    });
  }

  informeVehiculosRutaCache.asignaciones = asignacionesList;

  // Resumen: total vehículos (catalog), asignados (únicos en asignaciones) y sin asignar
  const totalVehiculos = vehiculosList.length;
  const vehiculosAsignadosSet = new Set();
  asignacionesList.forEach(a => {
    if (a.vehiculo && a.vehiculo.id) vehiculosAsignadosSet.add(a.vehiculo.id);
  });
  const assignedCount = vehiculosAsignadosSet.size;
  const unassignedCount = Math.max(0, totalVehiculos - assignedCount);

  // Conteo por ruta
  const conteoPorRuta = new Map();
  asignacionesList.forEach(a => {
    const nombreRuta = a.ruta?.nombre || 'Sin nombre';
    conteoPorRuta.set(nombreRuta, (conteoPorRuta.get(nombreRuta) || 0) + 1);
  });
  const resumenRows = Array.from(conteoPorRuta.entries()).sort((a, b) => b[1] - a[1]);

  // Construir controles y resumen con el mismo estilo visual que Informe Conductores
  const resumenItems = [];
  resumenItems.push(`<div class="resumen-item resumen-item--total"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z"/></svg></div><div class="resumen-text"><span>Total Vehículos</span><strong>${totalVehiculos}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--lic"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19l12-12L19.6 5.6z"/></svg></div><div class="resumen-text"><span>Vehículos Asignados</span><strong>${assignedCount}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--sin"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></div><div class="resumen-text"><span>Sin Asignar</span><strong>${unassignedCount}</strong></div></div>`);

  // Filtro de rutas
  const rutasOptions = ['<option value="todas">Todas</option>'];
  // Preferir catálogo /rutas si está disponible
  if (Array.isArray(rutasList) && rutasList.length) {
    rutasList.forEach(r => {
      if (r && r.id) rutasOptions.push(`<option value="${r.id}">${r.nombre || r.name || 'Ruta #' + r.id}</option>`);
    });
  } else {
    // Fallback: usar nombres detectados en asignaciones
    const seen = new Set();
    resumenRows.forEach(([nombre, count], idx) => {
      if (!seen.has(nombre)) {
        rutasOptions.push(`<option value="${nombre}">${nombre}</option>`);
        seen.add(nombre);
      }
    });
  }

  const filtroEstadoHtml = '';
  const controls = `<div class="informe-controls">
        <div class="resumen-grid resumen-grid-enhanced">
            ${resumenItems.join('\n')}
        </div>
        <div class="filtros-grid filtros-grid-enhanced" style="align-items:center;">
            ${filtroEstadoHtml}
            <div class="filtro-group">
                <label for='filtro-ruta-veh' class='filtro-label'>Ruta</label>
                <select id="filtro-ruta-veh" class="filtro-select filtro-select--wide">
                    ${rutasOptions.join('\n')}
                </select>
            </div>
            <div class="export-buttons">
                <button id="btn-export-vehiculos-ruta" class="btn-export btn-export--primary"><svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M4 17.5C4 16.672 4.672 16 5.5 16h13c.828 0 1.5.672 1.5 1.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5Z'/><path d='M12 3v11'/><path d='M8 10.5l4 3.5 4-3.5'/></svg> Exportar CSV</button>
            </div>
        </div>
    </div>`;

  const tabla = `<div class="tabla-wrapper">${renderTablaVehiculosRutaDetalle()}</div>`;
  const html = '<h3 class="informe-title">Informe: Vehículos por Ruta</h3>' + controls + tabla;
  const cont = document.getElementById('informe-result');
  cont.innerHTML = html;

  // Listener para cambio de ruta
  const filtroRutaEl = document.getElementById('filtro-ruta-veh');
  filtroRutaEl.addEventListener('change', (e) => {
    const val = e.target.value;
    const tableWrap = cont.querySelector('.tabla-wrapper');
    if (!tableWrap) return;
    if (val === 'todas') tableWrap.innerHTML = renderTablaVehiculosRutaDetalle();
    else tableWrap.innerHTML = renderTablaVehiculosRutaDetalle(val);
  });

  // Exportar CSV (respeta filtro)
  document.getElementById('btn-export-vehiculos-ruta').addEventListener('click', () => {
    const rutaVal = document.getElementById('filtro-ruta-veh').value;
    const rows = [
      ['Ruta', 'Placa', 'Tipo', 'Kilometraje', 'Fecha/Hora']
    ];
    const source = informeVehiculosRutaCache.asignaciones || [];
    const filtered = (rutaVal && rutaVal !== 'todas') ? source.filter(a => (a.ruta && (a.ruta.id == rutaVal || a.ruta.nombre == rutaVal))) : source;
    filtered.forEach(a => {
      rows.push([a.ruta?.nombre || 'N/A', a.vehiculo?.placa || 'N/A', a.vehiculo?.tipo?.nombre || 'N/A', a.kilometraje || '', a.fecha_hora || '']);
    });
    exportCSV('informe_vehiculos_ruta.csv', rows);
  });
}

// Exponer al scope global
window.loadInformeConductores = loadInformeConductores;
window.loadInformeVehiculosRuta = loadInformeVehiculosRuta;
window.exportCSV = exportCSV;