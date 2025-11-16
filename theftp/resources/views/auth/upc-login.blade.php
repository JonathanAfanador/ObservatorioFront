@extends('layouts.landing')

@section('content')
  <x-landing.header />

  <main style="padding:40px 20px; display:flex; justify-content:center;">
    <div class="card-auth" style="width:420px; background:#fff; border-radius:14px; box-shadow:0 12px 30px rgba(0,0,0,0.06); padding:26px;">
      <div style="display:flex; justify-content:center; gap:16px; margin-bottom:12px; align-items:center">
        <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía" style="height:56px; object-fit:contain;" onerror="this.style.display='none'">
        <img src="{{ asset('images/logo-unipiloto.png') }}" alt="UPC" style="height:56px; object-fit:contain;" onerror="this.style.display='none'">
      </div>

      <h1 style="text-align:center; font-size:22px; margin-bottom:8px;">Iniciar sesión</h1>
      <div style="display:flex; justify-content:center; margin-bottom:12px;">
        <button class="google-btn" onclick="alert('Inicio con Google no configurado')" style="border-radius:8px;padding:8px 12px;background:#fff;border:1px solid #e6e6e6;"> <i class="fab fa-google"></i> Continuar con Google</button>
      </div>

      <form id="loginForm">
        <div class="form-group">
          <label for="email">Correo</label>
          <input type="email" id="email" name="email" placeholder="correo@ejemplo.com" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
          <small id="emailError" style="color:#c0392b"></small>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" name="password" placeholder="Contraseña" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
          <small id="passwordError" style="color:#c0392b"></small>
        </div>

        <div class="form-group">
          <label>Iniciar como</label>
          <div class="role-select" id="roleSelect" style="display:flex; gap:8px; margin-top:6px;">
            <button type="button" data-role="UPC" class="active" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6e6e6;background:#fff;">UPC</button>
            <button type="button" data-role="Empresa" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6e6e6;background:#fff;">Empresa</button>
            <button type="button" data-role="Secretaria" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6e6e6;background:#fff;">Secretaría</button>
          </div>
        </div>

        <button type="submit" class="submit" style="width:100%; margin-top:14px; background:#d92525; color:#fff; border:none; padding:10px 12px; border-radius:8px; font-weight:700;">Entrar</button>
      </form>

      <div style="text-align:center; margin-top:12px; color:#666;">¿No tienes cuenta? <a href="/registro-upc">Regístrate</a></div>
    </div>
  </main>

  <x-landing.footer />

  @push('scripts')
  <script>
    // Role selector logic
    let selectedRole = 'UPC';
    document.querySelectorAll('#roleSelect button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#roleSelect button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRole = btn.getAttribute('data-role');
      });
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      document.getElementById('emailError').textContent = '';
      document.getElementById('passwordError').textContent = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

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
