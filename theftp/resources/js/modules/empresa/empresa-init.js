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

  const validViews = ['dashboard', 'resoluciones', 'conductores', 'licencias', 'vehiculos', 'rutas', 'asignaciones', 'informes'];

  let hash = window.location.hash.substring(1) || 'dashboard';
  if (!validViews.includes(hash)) {
    hash = 'dashboard';
    window.location.hash = 'dashboard';
  }

  navigateTo(hash);

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
    if (target.classList.contains('btn-edit-conductor')) {
      e.preventDefault();
      const conductorId = target.getAttribute('data-conductor-id');
      console.log('Click en editar conductor:', conductorId);
      editConductor(conductorId);
    }
    if (target.classList.contains('btn-delete-conductor')) {
      e.preventDefault();
      const conductorId = target.getAttribute('data-conductor-id');
      console.log('Click en eliminar conductor:', conductorId);
      deleteConductor(conductorId);
    }

    // Botones de cancelar modales
    if (target.id === 'btn-cancel-conductor' || target.closest('#btn-cancel-conductor')) {
      e.preventDefault();
      document.getElementById('modal-conductor').style.display = 'none';
    }
    if (target.id === 'btn-cancel-licencia' || target.closest('#btn-cancel-licencia')) {
      e.preventDefault();
      document.getElementById('modal-licencia').style.display = 'none';
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
  });

  console.log(' Event listeners con delegación configurados');
}

// Exponer al scope global
window.initDashboard = initDashboard;
window.setupEventListeners = setupEventListeners;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}