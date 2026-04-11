/**
 * ============================================
 * ADMIN OVERVIEW MODULE (CENTRO DE CONTROL FINAL)
 * ============================================
 * Motor de inteligencia optimizado para el dashboard.
 */
const AdminOverview = (function() {
    'use strict';

    async function loadStats() {
        try {
            // Captura de métricas globales (sin auditoría)
            const [users, roles, companies, routes, vehicles, licenses] = await Promise.all([
                AdminBase.apiCall('/users', 'GET', { limit: 1 }),
                AdminBase.apiCall('/rol', 'GET', { limit: 1 }),
                AdminBase.apiCall('/empresas', 'GET', { limit: 1 }),
                AdminBase.apiCall('/rutas', 'GET', { limit: 1 }),
                AdminBase.apiCall('/vehiculos', 'GET', { limit: 1 }),
                AdminBase.apiCall('/licencias', 'GET', { limit: 1 })
            ]);

            renderKPIs({
                users: users?.meta?.total || users?.total || 0,
                roles: roles?.meta?.total || roles?.total || 0,
                companies: companies?.meta?.total || companies?.total || 0,
                routes: routes?.meta?.total || routes?.total || 0,
                vehicles: vehicles?.meta?.total || vehicles?.total || 0,
                licenses: licenses?.meta?.total || licenses?.total || 0
            });

        } catch (e) {
            console.error('❌ Error cargando el Centro de Control:', e);
            const feed = document.getElementById('admin-recent-activity');
            if (feed) feed.innerHTML = '<p class="text-center text-red-500 py-10 font-bold text-xs uppercase tracking-widest">Error al sincronizar feed de auditoría</p>';
        }
    }

    function renderKPIs(data) {
        const container = document.getElementById('admin-stats');
        if (!container) return;

        const kpis = [
            { 
                label: 'Identidades Académicas', 
                val: data.users, 
                view: 'users',
                color: 'blue',
                icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
            },
            { 
                label: 'Empresas Operadoras', 
                val: data.companies, 
                view: 'empresas',
                color: 'emerald',
                icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            },
            { 
                label: 'Unidades de Flota', 
                val: data.vehicles, 
                view: 'vehiculos',
                color: 'amber',
                icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'
            },
            { 
                label: 'Licencias Avaladas', 
                val: data.licenses, 
                view: 'licencias',
                color: 'rose',
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
            }
        ];

        container.innerHTML = kpis.map(k => `
            <div onclick="showView('${k.view}')" class="group relative bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between">
                <div class="absolute -right-6 -bottom-6 text-slate-50 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                    <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="${k.icon}"></path></svg>
                </div>
                
                <div class="flex flex-col relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-14 h-14 rounded-2xl bg-${k.color}-50 text-${k.color}-600 border border-${k.color}-100 flex items-center justify-center shadow-sm group-hover:bg-${k.color}-600 group-hover:text-white transition-all duration-500">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${k.icon}"></path></svg>
                        </div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">${k.label}</span>
                    </div>
                    <div>
                        <span class="text-5xl font-black text-slate-900 tracking-tighter">${k.val.toLocaleString()}</span>
                        <div class="mt-4 flex items-center gap-2">
                             <span class="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">Sincronizado</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }


    return { loadStats };
})();

/**
 * NAVEGACIÓN GLOBAL DEL DASHBOARD
 * Expuesta a window para botones onclick en Blade.
 */
window.showView = function(viewName) {
    if (typeof window.loadViewData === 'function') {
        window.loadViewData(viewName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Fallback si admin-nav no ha cargado totalmente
        const views = document.querySelectorAll('.dashboard-view');
        views.forEach(v => v.style.display = 'none');
        const target = document.getElementById(`view-${viewName}`);
        if (target) target.style.display = 'block';
    }
};

// Punto de Entrada e Inicialización Global
document.addEventListener('DOMContentLoaded', () => {
    if (typeof buildAdminMenu === 'function') buildAdminMenu();

    const overviewView = document.getElementById('view-overview');
    if (overviewView) {
        overviewView.style.display = 'block';
        AdminOverview.loadStats();
    }

    // Listeners refinados
    document.getElementById('btn-add-user')?.addEventListener('click', () => { if (typeof openModalUser === 'function') openModalUser(); });
    document.getElementById('form-user')?.addEventListener('submit', (e) => { if (typeof saveUser === 'function') saveUser(e); });
    document.getElementById('btn-cancel-user')?.addEventListener('click', () => { 
        const mod = document.getElementById('modal-user');
        if (mod) mod.style.display = 'none'; 
    });

    if (typeof setupPersonaFilter === 'function') setupPersonaFilter();
    
    console.log('Centro de Control Administrativo Sincronizado.');
});

window.AdminOverview = AdminOverview;
window.loadStats = AdminOverview.loadStats;