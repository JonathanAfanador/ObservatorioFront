document.addEventListener('DOMContentLoaded', function() {

    // 1. Construir menú lateral
    buildAdminMenu();

    // 2. Mostrar vista inicial
    document.getElementById('view-overview').style.display = 'block';
    loadStats();

    // 3. Botones de usuarios
    document.getElementById('btn-add-user')?.addEventListener('click', () => openModalUser());
    document.getElementById('form-user')?.addEventListener('submit', saveUser);
    document.getElementById('btn-cancel-user')?.addEventListener('click', () => {
        document.getElementById('modal-user').style.display = 'none';
    });
    document.getElementById('toggle-deleted-users')?.addEventListener('change', loadUsers);

    // 4. Botones de roles
    document.getElementById('btn-add-role')?.addEventListener('click', () => openModalRole());
    document.getElementById('form-role')?.addEventListener('submit', saveRole);
    document.getElementById('btn-cancel-role')?.addEventListener('click', () => {
        document.getElementById('modal-role').style.display = 'none';
    });

    // 5. Buscador de personas en el modal de usuario
    setupPersonaFilter();
});