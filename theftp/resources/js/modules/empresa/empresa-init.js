// ==========================
// INICIALIZACIÓN
// ==========================

// Reemplazar menú inmediatamente para evitar ver el menú por defecto
async function initDashboard() {

  console.log('=== INIT DASHBOARD EMPRESA ===');

  // Usar window.myEmpresaId para que todos los módulos compartan el mismo valor
  window.myEmpresaId = sessionStorage.getItem('user_empresa_id');
  const roleId = sessionStorage.getItem('user_role_id');

  // Seguridad: si es usuario empresa (role_id = 3) pero no tiene ID
  if (roleId === "3" && !window.myEmpresaId) {
    console.warn("Usuario empresa sin 'user_empresa_id' en sessionStorage. Intentando recuperar del backend...");

    try {
      const me = await apiGet('/auth/me');
      if (me && me.empresa_id) {
        window.myEmpresaId = me.empresa_id;
        sessionStorage.setItem('user_empresa_id', window.myEmpresaId);
        sessionStorage.setItem('empresa_id', window.myEmpresaId);
        console.log("empresa_id recuperado correctamente:", window.myEmpresaId);
      } else {
        console.error("El usuario no tiene empresa asignada en el backend.");
        alert("No tienes una empresa asignada. Contacta al administrador.");
        return;
      }
    } catch (err) {
      console.error("Error al recuperar datos del usuario:", err);
      alert("Error de sesión. Serás redirigido al login.");
      window.location.href = '/login';
      return;
    }
  }

  if (window.myEmpresaId && !sessionStorage.getItem('empresa_id')) {
    sessionStorage.setItem('empresa_id', window.myEmpresaId);
  }

  console.log('Empresa activa ID:', window.myEmpresaId);

  // Dejamos disponible globalmente (muy útil para listRutas(), listConductores(), etc.)
  window.getCurrentEmpresaId = () => window.myEmpresaId;

  buildEmpresaMenu();
  setupEventListeners();

  console.log('Botones después de setupEventListeners:', {
    conductor: document.getElementById('btn-add-conductor')
    , vehiculo: document.getElementById('btn-add-vehiculo')
    , ruta: document.getElementById('btn-add-ruta')
    , licencia: document.getElementById('btn-add-licencia')
    , asignacion: document.getElementById('btn-add-asignacion')
  });

  const validViews = ['dashboard', 'resoluciones', 'conductores', 'licencias', 'restricciones', 'vehiculos', 'rutas', 'asignaciones', 'informes'];

  let hash = window.location.hash.substring(1) || 'dashboard';
  if (!validViews.includes(hash)) {
    hash = 'dashboard';
    window.location.hash = 'dashboard';
  }

  navigateTo(hash);
  applyPermissionsToUI();

  window.addEventListener('hashchange', () => {
    let view = window.location.hash.substring(1) || 'dashboard';
    if (!validViews.includes(view)) {
      view = 'dashboard';
      window.location.hash = 'dashboard';
    }
    navigateTo(view);
  });
}

// ==========================
// CONFIGURAR EVENT LISTENERS
// ==========================
function setupEventListeners() {
  console.log('=== SETUP EVENT LISTENERS CON DELEGACIÓN ===');

  // Usar delegación de eventos en el documento para capturar todos los clics
  // Esto funciona incluso si los elementos están ocultos o se agregan después
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Botón agregar conductor
    if (target.id === 'btn-add-conductor' || target.closest('#btn-add-conductor')) {
      e.preventDefault();
      console.log('Click en agregar conductor');
      openModalConductor();
    }

    // Botón agregar licencia
    if (target.id === 'btn-add-licencia' || target.closest('#btn-add-licencia')) {
      e.preventDefault();
      console.log('Click en agregar licencia');
      openModalLicencia();
    }

    // Botón agregar vehículo
    if (target.id === 'btn-add-vehiculo' || target.closest('#btn-add-vehiculo')) {
      e.preventDefault();
      console.log('Click en agregar vehículo');
      openModalVehiculo();
    }

    // Botón agregar ruta
    if (target.id === 'btn-add-ruta' || target.closest('#btn-add-ruta')) {
      e.preventDefault();
      console.log('Click en agregar ruta');
      openModalRuta();
    }

    // Botón agregar asignación
    if (target.id === 'btn-add-asignacion' || target.closest('#btn-add-asignacion')) {
      e.preventDefault();
      console.log('Click en agregar asignación');
      openModalAsignacion();
    }

    // Botones editar/eliminar conductores
    if (target.classList.contains('btn-edit-conductor') || target.closest('.btn-edit-conductor')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-edit-conductor') ? target : target.closest('.btn-edit-conductor');
      const conductorId = btn.getAttribute('data-conductor-id');
      console.log('Click en editar conductor:', conductorId);
      editConductor(conductorId);
    }
    if (target.classList.contains('btn-historial-conductor') || target.closest('.btn-historial-conductor')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-historial-conductor') ? target : target.closest('.btn-historial-conductor');
      const conductorId = btn.getAttribute('data-conductor-id');
      console.log('Click en historial conductor:', conductorId);
      openModalNovedades(conductorId);
    }
    if (target.classList.contains('btn-delete-conductor') || target.closest('.btn-delete-conductor')) {
      e.preventDefault();
      const conductorId = target.getAttribute('data-conductor-id');
      console.log('Click en eliminar conductor:', conductorId);
      deleteConductor(conductorId);
    }

    // Botones editar/eliminar licencias
    if (target.classList.contains('btn-edit-licencia') || target.closest('.btn-edit-licencia')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-edit-licencia') ? target : target.closest('.btn-edit-licencia');
      const id = btn.getAttribute('data-id');
      if (window.editLicencia) window.editLicencia(id);
    }
    if (target.classList.contains('btn-delete-licencia') || target.closest('.btn-delete-licencia')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-delete-licencia') ? target : target.closest('.btn-delete-licencia');
      const id = btn.getAttribute('data-id');
      if (window.deleteLicencia) window.deleteLicencia(id);
    }

    // Botones editar/eliminar vehículos
    if (target.classList.contains('btn-edit-vehiculo') || target.closest('.btn-edit-vehiculo')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-edit-vehiculo') ? target : target.closest('.btn-edit-vehiculo');
      const id = btn.getAttribute('data-id');
      if (window.editVehiculo) window.editVehiculo(id);
    }
    if (target.classList.contains('btn-delete-vehiculo') || target.closest('.btn-delete-vehiculo')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-delete-vehiculo') ? target : target.closest('.btn-delete-vehiculo');
      const id = btn.getAttribute('data-id');
      if (window.deleteVehiculo) window.deleteVehiculo(id);
    }

    // Botones editar/eliminar rutas
    if (target.classList.contains('btn-edit-ruta') || target.closest('.btn-edit-ruta')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-edit-ruta') ? target : target.closest('.btn-edit-ruta');
      const id = btn.getAttribute('data-id');
      if (window.editRuta) window.editRuta(id);
    }
    if (target.classList.contains('btn-delete-ruta') || target.closest('.btn-delete-ruta')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-delete-ruta') ? target : target.closest('.btn-delete-ruta');
      const id = btn.getAttribute('data-id');
      if (window.deleteRuta) window.deleteRuta(id);
    }

    // Botones editar/eliminar asignaciones
    if (target.classList.contains('btn-edit-asignacion') || target.closest('.btn-edit-asignacion')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-edit-asignacion') ? target : target.closest('.btn-edit-asignacion');
      const id = btn.getAttribute('data-id');
      if (window.editAsignacion) window.editAsignacion(id);
    }
    if (target.classList.contains('btn-delete-asignacion') || target.closest('.btn-delete-asignacion')) {
      e.preventDefault();
      const btn = target.classList.contains('btn-delete-asignacion') ? target : target.closest('.btn-delete-asignacion');
      const id = btn.getAttribute('data-id');
      if (window.deleteAsignacion) window.deleteAsignacion(id);
    }


    // Botones de cancelar modales
    if (target.id === 'btn-cancel-conductor' || target.closest('#btn-cancel-conductor')) {
      e.preventDefault();
      document.getElementById('modal-conductor').style.display = 'none';
    }
    if (target.id === 'btn-cancel-novedades' || target.closest('#btn-cancel-novedades')) {
      e.preventDefault();
      document.getElementById('modal-novedades').style.display = 'none';
    }
    if (target.id === 'btn-cancel-licencia' || target.closest('#btn-cancel-licencia')) {
      e.preventDefault();
      document.getElementById('modal-licencia').style.display = 'none';
    }
    if (target.id === 'btn-cancel-novedades-licencia' || target.closest('#btn-cancel-novedades-licencia')) {
      e.preventDefault();
      document.getElementById('modal-novedades-licencia').style.display = 'none';
    }
    if (target.id === 'btn-cancel-vehiculo' || target.closest('#btn-cancel-vehiculo')) {
      e.preventDefault();
      document.getElementById('modal-vehiculo').style.display = 'none';
    }
    if (target.id === 'btn-cancel-ruta' || target.closest('#btn-cancel-ruta')) {
      e.preventDefault();
      document.getElementById('modal-ruta').style.display = 'none';
    }
    if (target.id === 'btn-cancel-asignacion' || target.closest('#btn-cancel-asignacion')) {
      e.preventDefault();
      document.getElementById('modal-asignacion').style.display = 'none';
    }
    if (target.id === 'btn-cancel-novedades-vehiculo' || target.closest('#btn-cancel-novedades-vehiculo')) {
      e.preventDefault();
      document.getElementById('modal-novedades-vehiculo').style.display = 'none';
    }

    // Botones de informes
    if (target.id === 'btn-informe-conductores' || target.closest('#btn-informe-conductores')) {
      e.preventDefault();
      loadInformeConductores();
    }
    if (target.id === 'btn-informe-vehiculos-ruta' || target.closest('#btn-informe-vehiculos-ruta')) {
      e.preventDefault();
      loadInformeVehiculosRuta();
    }
  });

  // Event listeners para formularios (submit)
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-conductor') {
      e.preventDefault();
      saveConductor(e);
    }
    if (e.target.id === 'form-novedad-conductor') {
      e.preventDefault();
      saveNovedadConductor(e);
    }
    if (e.target.id === 'form-licencia') {
      e.preventDefault();
      saveLicencia(e);
    }
    if (e.target.id === 'form-vehiculo') {
      e.preventDefault();
      saveVehiculo(e);
    }
    if (e.target.id === 'form-ruta') {
      e.preventDefault();
      saveRuta(e);
    }
    if (e.target.id === 'form-asignacion') {
      e.preventDefault();
      saveAsignacion(e);
    }
    if (e.target.id === 'form-novedad-licencia') {
      e.preventDefault();
      saveNovedadLicencia(e);
    }
    if (e.target.id === 'form-novedad-vehiculo') {
      e.preventDefault();
      saveNovedadVehiculo(e);
    }
    // Soporte para Enter en búsqueda de resoluciones (si se usa un input fuera de un form submit tradicional)
    if (e.target.id === 'resolucion-search-text') {
       e.preventDefault();
       handleResolucionesSearch();
    }
  });

  // Listener específico para Enter en búsqueda de resoluciones
  const resolSearchInput = document.getElementById('resolucion-search-text');
  if (resolSearchInput) {
    resolSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.handleResolucionesSearch();
      }
    });
  }

  // Listener para Enter en búsqueda de asignaciones (Fecha)
  const asigDateInput = document.getElementById('filter-asig-fecha');
  if (asigDateInput) {
    asigDateInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (window.handleAsignacionesSearch) window.handleAsignacionesSearch();
      }
    });
  }

  console.log(' Event listeners con delegación configurados');

  // Toggle "Otra Razón" para Novedades de Conductores
  const novedadTipoSelect = document.getElementById('novedad-tipo');
  if (novedadTipoSelect) {
    novedadTipoSelect.addEventListener('change', () => {
      const otraInput = document.getElementById('novedad-otra');
      if (otraInput) otraInput.style.display = novedadTipoSelect.value === 'Otra Razón' ? 'block' : 'none';
    });
  }

  // Toggle "Otra Razón" para Novedades de Licencias + Auto-cálculo Legal
  const novedadLicTipoSelect = document.getElementById('novedad-licencia-tipo');
  if (novedadLicTipoSelect) {
    const calcularFechaFin = () => {
      const select = document.getElementById('novedad-licencia-tipo');
      const fechaInicioEl = document.getElementById('novedad-licencia-inicio');
      const fechaFinEl = document.getElementById('novedad-licencia-fin');
      const noteDiv = document.getElementById('novedad-licencia-legal-note');
      const noteText = document.getElementById('novedad-licencia-legal-text');
      const otraInput = document.getElementById('novedad-licencia-otra');

      if (!select || !fechaInicioEl || !fechaFinEl) return;

      // Toggle "Otra Razón"
      if (otraInput) otraInput.style.display = select.value === 'Otra Razón' ? 'block' : 'none';

      const selectedOption = select.options[select.selectedIndex];
      if (!selectedOption || !select.value) {
        fechaFinEl.value = '';
        if (noteDiv) noteDiv.style.display = 'none';
        return;
      }

      const duracionMeses = parseInt(selectedOption.getAttribute('data-duracion') || '0');

      // Si la duración es 0, es indefinido o variable
      if (duracionMeses === 0) {
        fechaFinEl.value = '';
        if (noteDiv && noteText) {
          if (select.value.includes('Muerte')) {
            noteText.textContent = 'Esta sanción es definitiva e irreversible. No hay fecha de levantamiento.';
          } else if (select.value.includes('Imposibilidad') && select.value.includes('transitoria')) {
            noteText.textContent = 'La suspensión durará mientras persista la incapacidad. Se requiere un nuevo examen de aptitud de un CRC para levantarla.';
          } else if (select.value.includes('judicial')) {
            noteText.textContent = 'El tiempo será determinado por el juez en la sentencia. Ingrese la fecha de fin manualmente si la conoce.';
            fechaFinEl.removeAttribute('readonly');
            fechaFinEl.style.backgroundColor = '#fff';
            fechaFinEl.style.cursor = 'pointer';
          } else if (select.value === 'Otra Razón') {
            noteText.textContent = 'Ingrese la duración manualmente.';
            fechaFinEl.removeAttribute('readonly');
            fechaFinEl.style.backgroundColor = '#fff';
            fechaFinEl.style.cursor = 'pointer';
          } else {
            noteText.textContent = 'Duración variable. Ingrese la fecha de fin manualmente si aplica.';
            fechaFinEl.removeAttribute('readonly');
            fechaFinEl.style.backgroundColor = '#fff';
            fechaFinEl.style.cursor = 'pointer';
          }
          noteDiv.style.display = 'block';
        }
        return;
      }

      // Hacer el campo readonly de nuevo
      fechaFinEl.setAttribute('readonly', true);
      fechaFinEl.style.backgroundColor = '#f3f4f6';
      fechaFinEl.style.cursor = 'not-allowed';

      // Si hay fecha de inicio, calcular la fecha fin
      if (fechaInicioEl.value) {
        const inicio = new Date(fechaInicioEl.value + 'T00:00:00');
        const fin = new Date(inicio);
        fin.setMonth(fin.getMonth() + duracionMeses);
        fechaFinEl.value = fin.toISOString().split('T')[0];
      }

      // Mostrar nota legal
      if (noteDiv && noteText) {
        const anios = Math.floor(duracionMeses / 12);
        const meses = duracionMeses % 12;
        let durText = '';
        if (anios > 0 && meses > 0) durText = `${anios} año(s) y ${meses} mes(es)`;
        else if (anios > 0) durText = `${anios} año(s)`;
        else durText = `${meses} mes(es)`;

        if (select.value.includes('Cancelación')) {
          noteText.textContent = `Cancelación definitiva. Inhabilitación legal de ${durText} para obtener una nueva licencia (Sentencia C-428/2019).`;
        } else {
          noteText.textContent = `Suspensión temporal de ${durText} según el C.N.T.T. La licencia podrá recuperarse al finalizar el periodo.`;
        }
        noteDiv.style.display = 'block';
      }
    };

    novedadLicTipoSelect.addEventListener('change', calcularFechaFin);

    const fechaInicioLic = document.getElementById('novedad-licencia-inicio');
    if (fechaInicioLic) {
      fechaInicioLic.addEventListener('change', calcularFechaFin);
    }
  }
}

/**
 * Oculta botones de creación del layout si el usuario no tiene permisos 'create'
 */
function applyPermissionsToUI() {
  const mapping = [
    { id: 'btn-add-conductor', table: 'conductores' },
    { id: 'btn-add-licencia',  table: 'licencias' },
    { id: 'btn-add-vehiculo',  table: 'vehiculo' },
    { id: 'btn-add-ruta',      table: 'rutas' },
    { id: 'btn-add-asignacion',table: 'rutas' }, // Asignaciones dependen de rutas en el seeder
    { id: 'btn-add-restriccion',table: 'licencias' } // Restricciones vinculadas a licencias
  ];

  mapping.forEach(item => {
    const el = document.getElementById(item.id);
    if (el && !window.canCreate(item.item || item.table)) {
      el.style.display = 'none';
      console.log(`UI: Ocultando botón ${item.id} por falta de permiso 'create' en ${item.table}`);
    }
  });
}

// Exponer al scope global
window.initDashboard = initDashboard;
window.setupEventListeners = setupEventListeners;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}