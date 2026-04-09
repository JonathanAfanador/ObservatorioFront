/**
 * ============================================
 * ADMIN BACKUPS MODULE
 * ============================================
 * Gestión de copias de seguridad en Google Drive.
 * Depende de: AdminBase
 */

const AdminBackups = {
    initialized: false,

    init() {
        if (this.initialized) return;
        console.log("Initializing AdminBackups...");
        this.setupEventListeners();
        this.initialized = true;
    },

    setupEventListeners() {
        // El botón de generar backup manual está en el HTML (admin.blade.php)
        // y llama directamente a AdminBackups.createManualBackup()
    },

    async load() {
        const container = document.getElementById('backups-table-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-slate-300">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-4"></div>
                <span class="text-xs font-black uppercase tracking-widest">Consultando Google Drive...</span>
            </div>
        `;

        try {
            const response = await fetch('/api/backups', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                document.getElementById('backup-disk-name').textContent = `${result.disk.toUpperCase()} (Conectado)`;
                this.renderTable(result.data);
            } else {
                throw new Error(result.message || 'Error al cargar backups.');
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = `
                <div class="p-8 text-center">
                    <div class="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 inline-block">
                        <svg class="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <p class="font-black uppercase tracking-widest text-xs">Error de Conexión</p>
                        <p class="text-sm font-medium mt-1">${error.message}</p>
                    </div>
                </div>
            `;
        }
    },

    renderTable(backups) {
        const container = document.getElementById('backups-table-container');
        if (!container) return;

        if (!backups || backups.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-slate-300">
                    <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span class="text-xs font-black uppercase tracking-widest">No se encontraron respaldos en el almacenamiento</span>
                </div>
            `;
            return;
        }

        let html = `
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100">
                            <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Archivo</th>
                            <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tamaño</th>
                            <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha de Creación</th>
                            <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
        `;

        backups.forEach(backup => {
            const fileNameEncoded = btoa(backup.file_path);
            html += `
                <tr class="hover:bg-slate-50/50 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="text-sm font-bold text-slate-700">${backup.file_name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-tighter">${backup.file_size}</span>
                    </td>
                    <td class="px-6 py-4 text-xs font-medium text-slate-500">
                        ${backup.last_modified}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <a href="/api/backups/download/${fileNameEncoded}" target="_blank" class="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm" title="Descargar">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </a>
                            <button onclick="AdminBackups.deleteBackup('${fileNameEncoded}')" class="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm" title="Eliminar">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    },

    async createManualBackup() {
        if (!confirm('¿Seguro que desea generar una copia de seguridad ahora? Esto puede tardar unos segundos.')) return;

        const container = document.getElementById('backups-table-container');
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-blue-600 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span class="text-sm font-black uppercase tracking-widest">Creando Copia (No Cierres la Ventana)...</span>
                    <span class="text-xs font-medium mt-2 text-slate-500">Comprimiendo base de datos y subiendo a Google Drive</span>
                </div>
            `;
        }

        try {
            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                }
            });

            const result = await response.json();

            if (result.success) {
                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Respaldo Exitoso!',
                        text: 'El archivo ZIP ha sido guardado de forma segura en Google Drive.',
                        confirmButtonColor: '#3b82f6'
                    });
                } else {
                    alert('Backup creado exitosamente en Google Drive');
                }
                this.load(); // Recargar lista
            } else {
                throw new Error(result.message || 'Error desconocido del servidor');
            }
        } catch (error) {
            console.error(error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Fallo al Crear el Respaldo',
                    html: `<div class="text-left bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-60 mt-4 whitespace-pre-wrap font-mono">${error.message}</div>`,
                    confirmButtonColor: '#ef4444',
                    width: '600px'
                });
            } else {
                alert('Fallo al crear el backup:\n' + error.message);
            }
            this.load(); // Restaurar vista original
        }
    },

    async deleteBackup(fileBase64) {
        if (!confirm('¿Está seguro de eliminar esta copia de seguridad permanentemente del almacenamiento en la nube?')) return;

        try {
            const response = await fetch(`/api/backups/${fileBase64}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                }
            });

            const result = await response.json();

            if (result.success) {
                if (window.showNotification) showNotification('El archivo ha sido eliminado.', 'success');
                this.load();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            if (window.showNotification) showNotification('No se pudo eliminar: ' + error.message, 'error');
        }
    }
};

window.AdminBackups = AdminBackups;
export default AdminBackups;
