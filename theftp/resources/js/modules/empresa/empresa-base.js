let currentView = 'dashboard';
let editingId = null; // Para edición de registros
let myEmpresaId = null;
// Función auxiliar para leer cookies (CSRF de Sanctum)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}



// Intenta resolver el user id desde varias fuentes: sessionStorage keys, auth_user JSON, o el token JWT
function getUserId() {
  // Posibles claves donde se almacena el id directamente
  const keys = ['user_id', 'id', 'usuario_id'];
  for (const k of keys) {
    const v = sessionStorage.getItem(k);
    if (v) {
      const n = parseInt(v, 10);
      if (!isNaN(n)) return n;
    }
  }

  // Algunas apps guardan el usuario completo en `auth_user` o `authUser`
  const userJsonKeys = ['auth_user', 'authUser', 'user', 'usuario'];
  for (const k of userJsonKeys) {
    const raw = sessionStorage.getItem(k);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj) {
          const cand = obj.id || obj.user_id || obj.usuario_id || obj.uid || obj.sub;
          const n = parseInt(cand, 10);
          if (!isNaN(n)) return n;
        }
      } catch (e) {
        // no es JSON, ignorar
      }
    }
  }

  // Como último recurso, decodificar el payload mockeado si hiciera falta.
  // Con Sanctum SPA, el estado local ya no tiene el token JWT así que devolvemos null o obtenemos el rol del sessionStorage.
  return null;
}

// Sistema de notificaciones en página
function showNotification(type, title, message, duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icons = {
    success: '✓'
    , error: '✕'
    , warning: '⚠'
    , info: 'ℹ'
  };

  notification.innerHTML = `
        <div class="notification-icon">${icons[type] || '•'}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;

  // Botón cerrar
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.add('closing');
    setTimeout(() => notification.remove(), 300);
  });

  container.appendChild(notification);

  // Auto cerrar después del tiempo especificado
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('closing');
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
}

// Función de confirmación personalizada (reemplaza confirm())
function showConfirm(title, message, onConfirm, onCancel = null) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'notification confirm-dialog';

  confirmDialog.innerHTML = `
        <div class="notification-icon" style="background: #f59e0b !important;">⚠</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
            <div class="confirm-buttons" style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
                <button class="confirm-yes btn-delete" style="flex: 1;">Eliminar</button>
                <button class="confirm-no btn-secondary" style="flex: 1;">Cancelar</button>
            </div>
        </div>
    `;

  // Botón Sí (Eliminar)
  confirmDialog.querySelector('.confirm-yes').addEventListener('click', () => {
    confirmDialog.classList.add('closing');
    setTimeout(() => confirmDialog.remove(), 300);
    if (onConfirm) onConfirm();
  });

  // Botón No (Cancelar)
  confirmDialog.querySelector('.confirm-no').addEventListener('click', () => {
    confirmDialog.classList.add('closing');
    setTimeout(() => confirmDialog.remove(), 300);
    if (onCancel) onCancel();
  });

  container.appendChild(confirmDialog);
} // Normaliza respuestas de listado (soporta estructuras paginadas)
function normalizeList(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  // Estructura { data: [...] }
  if (Array.isArray(resp.data)) return resp.data;
  // Estructura { data: { data: [...] } }
  if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  // Estructura paginada { current_page, data: [...] }
  if (resp.current_page && Array.isArray(resp.data)) return resp.data;
  // Buscar el primer array de objetos dentro del objeto
  const values = Object.values(resp);
  for (const v of values) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
      return v;
    }
  }
  return [];
}

// Función para obtener datos seguros de relaciones
function getSafeData(obj, path, defaultValue = 'N/A') {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === null || result === undefined) {
      return defaultValue;
    }
  }
  return result || defaultValue;
}

// Wrapper para llamadas GET a la API
async function apiGet(path) {
  try {
    const response = await fetch(`/api${path}`, {
      method: 'GET',
      headers: window.getAuthHeaders ? window.getAuthHeaders() : { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error en GET:', error);
    return null;
  }
}

// Wrapper para llamadas POST a la API
async function apiPost(path, data) {
  try {
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: window.getAuthHeaders ? window.getAuthHeaders() : {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);

      // Si hay errores de validación, mostrarlos de forma legible
      if (errorData.errors && typeof errorData.errors === 'object') {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msgs}`;
          })
          .join('\n');
        throw new Error(errorMessages);
      }

      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en POST:', error);
    showNotification('error', 'Error al guardar', error.message);
    return null;
  }
}

// Wrapper para llamadas POST con archivos
async function apiPostFile(path, formData) {
  try {
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: window.getAuthHeaders ? window.getAuthHeaders() : {
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SERVER VALIDATION ERROR:', errorData);
      
      let msg = errorData.message || `HTTP ${response.status}`;
      if (errorData.errors) {
        msg = Object.values(errorData.errors).flat().join(' | ');
      }
      throw new Error(msg);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en POST con archivo:', error);
    alert('Error al guardar: ' + error.message);
    return null;
  }
}

// Wrapper para llamadas PUT a la API
async function apiPut(path, data) {
  try {
    const response = await fetch(`/api${path}`, {
      method: 'PUT',
      headers: window.getAuthHeaders ? window.getAuthHeaders() : {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en PUT:', error);
    showNotification('error', 'Error al actualizar', error.message);
    return null;
  }
}

// Wrapper para llamadas DELETE a la API
async function apiDelete(path) {
  try {
    const response = await fetch(`/api${path}`, {
      method: 'DELETE',
      headers: window.getAuthHeaders ? window.getAuthHeaders() : {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error en DELETE:', error);
    showNotification('error', 'Error al eliminar', error.message);
    return null;
  }
}

// ==========================
// EXPONER AL SCOPE GLOBAL
// Necesario porque Vite trata cada módulo importado como ES module scope.
// Las funciones declaradas aquí no son visibles en otros módulos sin esta asignación.
// ==========================
window.currentView = currentView;
window.editingId = editingId;
window.myEmpresaId = myEmpresaId;
window.getCookie = getCookie;
window.getUserId = getUserId;
window.showNotification = showNotification;
window.showConfirm = showConfirm;
window.normalizeList = normalizeList;
window.getSafeData = getSafeData;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPostFile = apiPostFile;
window.apiPut = apiPut;
window.apiDelete = apiDelete;