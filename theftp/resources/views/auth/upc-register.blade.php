<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registro - Observatorio</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @extends('layouts.landing')

    @section('content')
      <x-landing.header />

      <main style="padding:40px 20px; display:flex; justify-content:center;">
        <div class="card" style="width:520px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.06); padding:20px;">
          <div style="display:flex; justify-content:center; gap:14px; margin-bottom:8px; align-items:center;">
            <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía" style="height:64px; object-fit:contain;" onerror="this.style.display='none'">
            <img src="{{ asset('images/logo-unipiloto.png') }}" alt="UPC" style="height:64px; object-fit:contain;" onerror="this.style.display='none'">
          </div>

          <h2 style="text-align:center; margin-top:8px">Registro de usuario</h2>

          <form id="registerForm">
            <div style="display:flex; gap:10px">
              <div style="flex:1">
                <label for="first_name">Nombres</label>
                <input id="first_name" name="first_name" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
              </div>
              <div style="flex:1">
                <label for="last_name">Apellidos</label>
                <input id="last_name" name="last_name" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px">
              <div style="flex:1">
                <label for="tipo_ident">Tipo Identificación</label>
                <select id="tipo_ident" name="tipo_ident" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
                  <option value="1">Cédula</option>
                  <option value="2">Tarjeta Identidad</option>
                </select>
              </div>

              <div style="flex:1">
                <label for="nui">Número Ident.</label>
                <input id="nui" name="nui" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px">
              <div style="flex:1">
                <label for="gender">Género</label>
                <select id="gender" name="gender" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;"><option value="M">Masculino</option><option value="F">Femenino</option></select>
              </div>
              <div style="flex:1">
                <label for="phone">Teléfono</label>
                <input id="phone" name="phone" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
              </div>
            </div>

            <div style="margin-top:10px">
              <label for="email">Correo</label>
              <input id="email" name="email" type="email" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
            </div>

            <div style="display:flex; gap:10px; margin-top:10px">
              <div style="flex:1">
                <label for="password">Contraseña</label>
                <input id="password" name="password" type="password" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
              </div>
              <div style="flex:1">
                <label for="password_confirmation">Confirmar</label>
                <input id="password_confirmation" name="password_confirmation" type="password" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6;">
              </div>
            </div>

            <div style="margin-top:12px">
              <label>Registrarse como</label>
              <div class="role-select" style="display:flex; gap:8px; margin-top:6px">
                <button type="button" data-role="UPC" class="active" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6e6e6;background:#fff;">UPC</button>
                <button type="button" data-role="Empresa" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6e6e6;background:#fff;">Empresa</button>
              </div>
            </div>

            <div style="margin-top:14px">
              <button class="submit" type="submit" style="background:#1b6fbf; color:#fff; padding:10px 12px; border-radius:8px; border:none; width:100%;">Crear cuenta</button>
            </div>
          </form>
        </div>
      </main>

      <x-landing.footer />

      @push('scripts')
      <script>
        let selectedRole = 'UPC';
        document.querySelectorAll('.role-select button').forEach(b => b.addEventListener('click', () => {
          document.querySelectorAll('.role-select button').forEach(x=>x.classList.remove('active'));
          b.classList.add('active'); selectedRole = b.getAttribute('data-role');
        }));

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
            const url = selectedRole === 'UPC' ? '/api/auth/register-upc' : '/api/auth/register';
            const res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if(!res.ok) return alert(data.message || 'Error registrando');
            localStorage.setItem('token', data.token);
            window.location.href = selectedRole === 'UPC' ? '/dashboard/upc' : '/dashboard/empresa';
          } catch(err) { console.error(err); alert('Error de conexión.'); }
        });
      </script>
      @endpush

    @endsection
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.errors) {
            Object.keys(data.errors).forEach(f => {
              const el = document.getElementById(f + 'Error'); if (el) el.textContent = data.errors[f][0] || '';
            });
          } else {
            alert(data.message || 'Error en el registro');
          }
          return;
        }
        // On success redirect to login
        window.location.href = '/login-upc?success=Registro completado. Inicia sesión.';
      } catch (err) {
        console.error(err);
        alert('Error de conexión. Intenta nuevamente.');
      }
    });
  </script>
</body>
</html>
