@extends('layouts.landing')

@section('content')
  <main style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px 20px;">
    <div style="width:100%; max-width:480px; background:#fff; border-radius:16px; box-shadow:0 12px 30px rgba(0,0,0,0.06); padding:40px 30px;">
      <div style="display:flex; justify-content:center; gap:14px; margin-bottom:24px; align-items:center;">
        <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía" style="height:64px; object-fit:contain;" onerror="this.style.display='none'">
        <img src="{{ asset('images/logo-unipiloto.png') }}" alt="UPC" style="height:64px; object-fit:contain;" onerror="this.style.display='none'">
      </div>

      <h1 style="text-align:center; font-size:26px; margin-bottom:32px; color:#222; font-weight:700;">Iniciar sesión</h1>

      <form id="loginForm">
        <div style="margin-bottom:20px;">
          <label for="role" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Ingresa como:</label>
          <select id="role" name="role" style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; background:#fff; cursor:pointer; box-sizing:border-box;">
            <option value="UPC">Selecciona un rol</option>
            <option value="UPC">UPC</option>
            <option value="Empresa">Empresa</option>
            <option value="Secretaria">Secretaría</option>
          </select>
        </div>

        <div style="margin-bottom:20px;">
          <label for="email" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Correo</label>
          <input type="email" id="email" name="email" placeholder="correo@ejemplo.com" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          <small id="emailError" style="color:#c0392b; display:block; margin-top:4px;"></small>
        </div>

        <div style="margin-bottom:24px;">
          <label for="password" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Contraseña</label>
          <input type="password" id="password" name="password" placeholder="Tu contraseña" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          <small id="passwordError" style="color:#c0392b; display:block; margin-top:4px;"></small>
        </div>

        <button type="submit" class="submit" style="width:100%; background:#28a745; color:#fff; border:none; padding:14px 12px; border-radius:10px; font-weight:700; font-size:16px; cursor:pointer; transition: background 0.3s;" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">Entrar</button>
      </form>

      <div style="text-align:center; margin-top:20px; color:#666; font-size:14px;">¿No tienes cuenta? <a href="/registro" style="color:#28a745; text-decoration:none; font-weight:600; transition: color 0.3s;" onmouseover="this.style.color='#218838'" onmouseout="this.style.color='#28a745'">Regístrate</a></div>
    </div>
  </main>

  @push('scripts')
  <script>
    let selectedRole = 'UPC';

    // Sync dropdown with selectedRole
    document.getElementById('role').addEventListener('change', (e) => {
      selectedRole = e.target.value;
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      document.getElementById('emailError').textContent = '';
      document.getElementById('passwordError').textContent = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      selectedRole = document.getElementById('role').value;

      if (selectedRole === 'Selecciona un rol') {
        document.getElementById('emailError').textContent = 'Por favor selecciona un rol';
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
          const msg = data.message || 'Error en la autenticación';
          document.getElementById('emailError').textContent = msg;
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user_email', email);

        // Redirect based on selected role
        if (selectedRole === 'UPC') window.location.href = '/dashboard/upc';
        else if (selectedRole === 'Empresa') window.location.href = '/dashboard/empresa';
        else window.location.href = '/dashboard/secretaria';
      } catch (err) {
        console.error(err);
        document.getElementById('emailError').textContent = 'Error de conexión. Intenta de nuevo.';
      }
    });
  </script>
  @endpush

@endsection
