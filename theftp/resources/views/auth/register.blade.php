@extends('layouts.landing')

@section('content')
  <main style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px 20px;">
    <div style="width:100%; max-width:600px; background:#fff; border-radius:16px; box-shadow:0 12px 30px rgba(0,0,0,0.06); padding:40px 30px;">
      <div style="display:flex; justify-content:center; gap:14px; margin-bottom:24px; align-items:center;">
        <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía" style="height:64px; object-fit:contain;" onerror="this.style.display='none'">
        <img src="{{ asset('images/logo-unipiloto.png') }}" alt="UPC" style="height:64px; object-fit:contain;" onerror="this.style.display='none'">
      </div>

      <h2 style="text-align:center; font-size:26px; margin-bottom:32px; color:#222; font-weight:700;">Registro de usuario</h2>

      <form id="registerForm">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
          <div>
            <label for="first_name" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Nombres</label>
            <input id="first_name" name="first_name" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          </div>
          <div>
            <label for="last_name" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Apellidos</label>
            <input id="last_name" name="last_name" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
          <div>
            <label for="tipo_ident" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Tipo Identificación</label>
            <select id="tipo_ident" name="tipo_ident" style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; background:#fff; cursor:pointer; box-sizing:border-box; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
              <option value="1">Cédula</option>
              <option value="2">Tarjeta Identidad</option>
            </select>
          </div>
          <div>
            <label for="nui" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Número Ident.</label>
            <input id="nui" name="nui" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
          <div>
            <label for="gender" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Género</label>
            <select id="gender" name="gender" style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; background:#fff; cursor:pointer; box-sizing:border-box; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div>
            <label for="phone" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Teléfono</label>
            <input id="phone" name="phone" style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <label for="email" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Correo</label>
          <input id="email" name="email" type="email" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
          <div>
            <label for="password" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Contraseña</label>
            <input id="password" name="password" type="password" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          </div>
          <div>
            <label for="password_confirmation" style="display:block; margin-bottom:8px; font-weight:600; font-size:14px; color:#333;">Confirmar</label>
            <input id="password_confirmation" name="password_confirmation" type="password" required style="width:100%; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; transition:border-color 0.3s;" onfocus="this.style.borderColor='#28a745'" onblur="this.style.borderColor='#ddd'">
          </div>
        </div>

        <button class="submit" type="submit" style="width:100%; background:#28a745; color:#fff; padding:14px 12px; border-radius:10px; border:none; font-weight:700; font-size:16px; cursor:pointer; transition: background 0.3s;" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">Crear cuenta</button>
      </form>

      <div style="text-align:center; margin-top:20px; color:#666; font-size:14px;">¿Ya tienes cuenta? <a href="/login" style="color:#28a745; text-decoration:none; font-weight:600; transition: color 0.3s;" onmouseover="this.style.color='#218838'" onmouseout="this.style.color='#28a745'">Inicia sesión</a></div>
    </div>
  </main>

  @push('scripts')
  <script>
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        tipo_ident_id: document.getElementById('tipo_ident').value,
        nui: document.getElementById('nui').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        password_confirmation: document.getElementById('password_confirmation').value,
      };

      try {
        // Registrar como UPC por defecto (ya que no hay selector de rol)
        const res = await fetch('/api/auth/register-upc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message || 'Error registrando');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_email', payload.email);
        window.location.href = '/dashboard/upc';
      } catch (err) {
        console.error(err);
        alert('Error de conexión.');
      }
    });
  </script>
  @endpush

@endsection
