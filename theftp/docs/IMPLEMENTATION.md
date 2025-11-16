# Documentación Técnica - Implementación UPC Role, Secretaría & Sistema de Autenticación Unificado

**Fecha:** Noviembre 15, 2025  
**Versión:** 2.0 (Dashboard Secretaría Agregado)  
**Estado:** Completado

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Backend - Estructura & Implementación](#backend---estructura--implementación)
4. [Endpoints API](#endpoints-api)
5. [Frontend - Vistas & Componentes](#frontend---vistas--componentes)
6. [Flujo de Autenticación](#flujo-de-autenticación)
7. [Base de Datos](#base-de-datos)
8. [Guía de Uso](#guía-de-uso)
9. [Instalación & Configuración](#instalación--configuración)
10. [Cambios Principales](#cambios-principales)

---

## Resumen Ejecutivo

### Objetivos Alcanzados

Se implementó un **sistema de autenticación unificado** con nuevos roles **UPC (Unidad de Policía de Carreteras)** y **Secretaría de Tránsito** que incluyen:

✅ **Rol UPC** - Permisos de lectura sobre empresas, conductores, vehículos  
✅ **Rol Secretaría** - Permisos CRUD en todas las tablas excepto auditoría  
✅ **5 tipos de reportes CSV** - Empresas, conductores activos, vehículos operativos, rutas activas, resoluciones (UPC)  
✅ **Estadísticas UPC y Secretaría** - Resumen y detallado del estado operacional  
✅ **Dashboard UPC** - Interfaz con botones de descarga de reportes y tarjetas de estadísticas  
✅ **Dashboard Secretaría** - Interfaz con tarjetas de gestión territorial, operacional y de usuarios  
✅ **Autenticación Unificada** - Página única de login con selector de rol (dropdown)  
✅ **Registro Unificado** - Página única de registro para UPC  
✅ **Diseño Consistente** - Color scheme verde (#28a745), interfaz moderna y responsive  

### Beneficios

- **Seguridad**: Token-based authentication con Laravel Sanctum
- **Escalabilidad**: Estructura modular lista para agregar nuevos roles/permisos
- **UX Mejorada**: Interfaz unificada, sin rutas fragmentadas
- **Reportes Automáticos**: Exportación de datos en CSV para análisis
- **Gestión Integral**: Secretaría puede administrar todas las áreas del transporte

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Browser)                      │
│  - Login/Register (Blade Views)                             │
│  - Dashboard UPC                                            │
│  - Token almacenado en localStorage                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/AJAX
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              LARAVEL 11 + SANCTUM (Backend)                 │
│                                                             │
│  ┌─ API Routes ──────────────────────────────────────────┐ │
│  │ /api/auth/login - Autenticación                       │ │
│  │ /api/auth/register-upc - Registro UPC                 │ │
│  │ /api/reportes/* - Generación de CSV                   │ │
│  │ /api/estadisticas/* - Cálculo de métricas             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Base de Datos ────────────────────────────────────────┐ │
│  │ Users, Roles, Permissions (Sanctum)                   │ │
│  │ Empresas, Conductores, Vehículos, etc.                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Modelos & Controllers ────────────────────────────────┐ │
│  │ AuthController, ReportesController,                   │ │
│  │ EstadisticasController                                │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL / MySQL                        │
│  - Tablas operacionales (empresas, conductores, vehículos) │
│  - Tablas de autenticación (users, roles, permissions)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend - Estructura & Implementación

### 1. Rol UPC - Definición

**Enum de Roles** (`app/Enums/Reportes.php`):
```php
enum Reportes: string
{
    case EMPRESAS = 'empresas';
    case CONDUCTORES_ACTIVOS = 'conductores_activos';
    case VEHICULOS_OPERATIVOS = 'vehiculos_operativos';
    case RUTAS_ACTIVAS = 'rutas_activas';
    case RESOLUCIONES = 'resoluciones';
}
```

**Permisos UPC** (Seeder):
- `read:empresas` - Ver información de empresas
- `read:conductores` - Ver información de conductores
- `read:vehiculos` - Ver información de vehículos
- `read:rutas` - Ver información de rutas
- `read:reportes` - Descargar reportes en CSV

### 2. Controllers Implementados

#### AuthController (`app/Http/Controllers/AuthController.php`)

```php
// POST /api/auth/login
public function login(Request $request)
{
    // Valida credenciales y retorna token
    // Disponible para UPC, Empresa, Secretaría
}

// POST /api/auth/register-upc
public function registerUpc(Request $request)
{
    // Registra nuevo usuario como UPC
    // Retorna token autenticado
}
```

#### ReportesController (`app/Http/Controllers/ReportesController.php`)

```php
// GET /api/reportes/empresas
public function empresas()
{
    // Retorna CSV con lista de empresas
}

// GET /api/reportes/conductores-activos
public function conductoresActivos()
{
    // Retorna CSV con conductores activos
}

// GET /api/reportes/vehiculos-operativos
public function vehiculosOperativos()
{
    // Retorna CSV con vehículos operativos
}

// GET /api/reportes/rutas-activas
public function rutasActivas()
{
    // Retorna CSV con rutas activas
}

// GET /api/reportes/resoluciones
public function resoluciones()
{
    // Retorna CSV con resoluciones
}
```

#### EstadisticasController (`app/Http/Controllers/EstadisticasController.php`)

```php
// GET /api/estadisticas/resumen
public function resumen()
{
    // Retorna métricas principales
    // {
    //   "total_empresas": 50,
    //   "conductores_activos": 250,
    //   "vehiculos_operativos": 180,
    //   "rutas_activas": 45
    // }
}

// GET /api/estadisticas/detallado
public function detallado()
{
    // Retorna estadísticas detalladas por categoría
}
```

### 3. Migraciones

**Campos agregados a tabla `empresas`** (`database/migrations/...`):
- `direccion` (string)
- `telefono` (string)
- `email` (string)
- `nui` (string, único)

---

## Endpoints API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Autenticación (email + password) | ❌ |
| POST | `/api/auth/register-upc` | Registro como UPC | ❌ |
| GET | `/api/reportes/empresas` | CSV - Listado de empresas | ✅ UPC |
| GET | `/api/reportes/conductores-activos` | CSV - Conductores activos | ✅ UPC |
| GET | `/api/reportes/vehiculos-operativos` | CSV - Vehículos operativos | ✅ UPC |
| GET | `/api/reportes/rutas-activas` | CSV - Rutas activas | ✅ UPC |
| GET | `/api/reportes/resoluciones` | CSV - Resoluciones | ✅ UPC |
| GET | `/api/estadisticas/resumen` | JSON - Métricas principales (UPC) | ✅ UPC |
| GET | `/api/estadisticas/detallado` | JSON - Estadísticas detalladas (UPC) | ✅ UPC |
| GET | `/api/secretaria/estadisticas/resumen` | JSON - Métricas principales (Secretaría) | ✅ Secretaría |
| GET | `/api/secretaria/estadisticas/detallado` | JSON - Estadísticas detalladas (Secretaría) | ✅ Secretaría |

### Ejemplo de Uso

**Login:**
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "upc@example.com",
    "password": "password123",
    "role": "UPC"
  }'
```

**Respuesta:**
```json
{
  "token": "1|abc123...",
  "role": "UPC",
  "message": "Logged in successfully"
}
```

**Descargar Reporte:**
```bash
curl -X GET http://localhost/api/reportes/empresas \
  -H "Authorization: Bearer 1|abc123..."
```

---

## Frontend - Vistas & Componentes

### 1. Estructura de Vistas

```
resources/views/
├── layouts/
│   └── landing.blade.php          # Layout base con background
├── auth/
│   ├── role-selection.blade.php   # Página de login unificada
│   └── register.blade.php         # Página de registro
├── dashboard/
│   ├── upc.blade.php              # Dashboard UPC
│   └── secretaria.blade.php       # Dashboard Secretaría (NUEVO)
└── components/
    └── landing/
        └── header.blade.php       # Header con navegación
```

### 2. Vistas Principales

#### `role-selection.blade.php` (Login Unificado)

**Características:**
- Dropdown para selección de rol (UPC, Empresa, Secretaría)
- Campos: Email, Contraseña
- Botón "Entrar" en verde (#28a745)
- Responsive y diseño limpio

**Flujo:**
1. Usuario selecciona rol desde dropdown
2. Ingresa email y password
3. Envía POST a `/api/auth/login`
4. Sistema verifica credenciales
5. Retorna token y redirige a `/dashboard/{rol}`

**Código destacado:**
```html
<select id="role" class="form-control" required>
    <option value="">Selecciona tu rol</option>
    <option value="UPC">UPC</option>
    <option value="Empresa">Empresa</option>
    <option value="Secretaría">Secretaría</option>
</select>
```

#### `register.blade.php` (Registro UPC)

**Características:**
- Formulario multi-campo (nombres, apellidos, tipo_ident, etc.)
- Sin selector de rol (auto-registra como UPC)
- Validación en tiempo real
- Botón verde (#28a745)

**Campos:**
- Nombres (requerido)
- Apellidos (requerido)
- Tipo de identificación (select)
- Número de identificación (requerido, único)
- Género (select)
- Teléfono (requerido)
- Email (requerido, único)
- Contraseña (requerido)
- Confirmar contraseña (requerido)

**Flujo:**
1. Usuario completa formulario
2. Envía POST a `/api/auth/register-upc`
3. Sistema valida datos
4. Crea usuario con rol UPC
5. Retorna token
6. Redirige a `/dashboard/upc`

#### `dashboard/upc.blade.php` (Dashboard UPC)

**Características:**
- Tarjetas de estadísticas (empresas, conductores, vehículos, rutas)
- Botones de descarga de reportes
- Barra lateral con navegación
- Diseño card-based con iconos Font Awesome

**Secciones:**
1. **Estadísticas** - Muestra números principales
2. **Reportes** - 5 botones de descarga CSV:
   - Empresas
   - Conductores Activos
   - Vehículos Operativos
   - Rutas Activas
   - Resoluciones
3. **Navegación** - Links a otras secciones (si existen)

#### `dashboard/secretaria.blade.php` (Dashboard Secretaría) - NUEVO

**Características:**
- Tarjetas de estadísticas de gestión territorial y operacional
- Sidebar de navegación con opciones de gestión
- Diseño similar a UPC pero enfocado en gestión integral
- Muestra 10 métricas principales

**Tarjetas de Estadísticas:**
1. **Gestión Territorial:** Municipios, Departamentos, Barrios
2. **Gestión Operacional:** Empresas, Conductores, Vehículos, Rutas
3. **Documentación:** Licencias, Personas, Usuarios

**Sidebar con opciones:**
- Panel Principal
- Gestión Territorial
- Empresas
- Conductores
- Vehículos
- Licencias
- Botón Cerrar sesión

### 3. Componentes Reutilizables

#### `components/landing/header.blade.php`

```html
<!-- Botones de navegación en header -->
<a href="/login" class="btn btn-outline-success">
    Inicia sesión
</a>
<a href="/registro" class="btn btn-success">
    Registrarse
</a>
```

### 4. Color Scheme & Diseño

**Colores Principales:**
- **Verde Primario:** `#28a745` (botones, links activos)
- **Verde Hover:** `#218838` (hover state)
- **Gris Bordes:** `#ddd` (inputs, cards)
- **Blanco:** `#fff` (backgrounds)
- **Gris Texto:** `#666` (textos secundarios)

**Tipografía:**
- Font: Bootstrap 5 defaults (sans-serif)
- Tamaños: Responsive con media queries

**Responsive:**
- Mobile: Stacked layout, inputs full-width
- Tablet: 2-column grid donde aplica
- Desktop: 3+ columns, optimizado

---

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO SIN SESIÓN                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Accede a http://localhost     │
        │  Landing Page → /login o       │
        │  /registro                     │
        └────────────────────────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
      ┌──────────────────┐  ┌──────────────────┐
      │ /login           │  │ /registro        │
      │ (role-selection) │  │ (register)       │
      └──────────────────┘  └──────────────────┘
              │                      │
              ▼                      ▼
      ┌──────────────────┐  ┌──────────────────┐
      │ Selecciona rol   │  │ Completa form    │
      │ Email + Password │  │ (auto-UPC)       │
      └──────────────────┘  └──────────────────┘
              │                      │
              └────────┬─────────────┘
                       ▼
       ┌───────────────────────────────────┐
       │ POST /api/auth/login (o register) │
       └───────────────────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────┐
       │ Laravel Sanctum verifica creds    │
       └───────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
    ✅ VÁLIDO                     ❌ INVÁLIDO
        │                             │
        ▼                             ▼
   Crea token                   Error 401/422
   localStorage                 
   {token, email}               
        │
        ▼
   Verifica rol
   {UPC, Empresa, Secretaría}
        │
        ▼
   Redirige a
   /dashboard/{rol}
        │
        ▼
    Dashboard carga
    - Estadísticas
    - Reportes
    - Botones descarga
        │
        ▼
┌─────────────────────────────────────────┐
│  USUARIO AUTENTICADO EN DASHBOARD       │
│  Token disponible en localStorage       │
│  Requests incluyen:                     │
│  Authorization: Bearer {token}          │
└─────────────────────────────────────────┘
```

### Implementación en JavaScript

**Login:**
```javascript
async function login(email, password, role) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });
    
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
        window.location.href = `/dashboard/${role.toLowerCase()}`;
    }
}
```

**Request Autenticado:**
```javascript
async function fetchWithAuth(url) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}
```

---

## Base de Datos

### Tablas Principales

#### users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| name | string | Nombre completo |
| email | string | Email único |
| password | string | Hash bcrypt |
| role_id | bigint | FK a roles |
| created_at | timestamp | Creación |
| updated_at | timestamp | Última actualización |

#### roles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| name | string | 'UPC', 'Empresa', 'Secretaría' |
| created_at | timestamp | Creación |

#### permissions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| name | string | 'read:empresas', 'read:reportes', etc. |
| created_at | timestamp | Creación |

#### role_permission
| Campo | Tipo | Descripción |
|-------|------|-------------|
| role_id | bigint | FK a roles |
| permission_id | bigint | FK a permissions |

#### empresas (Modificada)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| nombre | string | Nombre empresa |
| nui | string | Identificador único |
| direccion | string | Domicilio (NUEVO) |
| telefono | string | Teléfono (NUEVO) |
| email | string | Email (NUEVO) |
| created_at | timestamp | Creación |

### Relaciones

```
users → roles (Many-to-One)
roles ← permissions (Many-to-Many via role_permission)
empresas ← conductores (One-to-Many)
empresas ← vehiculos (One-to-Many)
```

---

## Guía de Uso

### Para Usuarios UPC

#### 1. Registro
1. Ir a `http://localhost/registro`
2. Completar formulario:
   - Nombres y apellidos
   - Tipo de documento
   - Número único de identificación
   - Género
   - Teléfono
   - Email
   - Contraseña
3. Hacer clic en "Registrarse"
4. Automáticamente redirige a dashboard

#### 2. Login
1. Ir a `http://localhost/login`
2. Seleccionar rol: **UPC** (dropdown)
3. Ingresar email y contraseña
4. Clic en "Entrar"
5. Accede al dashboard

#### 3. Dashboard UPC
- **Tarjetas de Estadísticas**: Muestra conteos en tiempo real
- **Descargar Reportes**: 5 botones para exportar CSV:
  - `Empresas` - Lista completa de empresas registradas
  - `Conductores Activos` - Conductores con estado activo
  - `Vehículos Operativos` - Vehículos en operación
  - `Rutas Activas` - Rutas en ejecución
  - `Resoluciones` - Resoluciones emitidas

#### 4. Descarga de Reportes
1. En dashboard, hacer clic en botón de reporte deseado
2. Navegador descarga archivo `.csv`
3. Abrir en Excel, Google Sheets o similar

---

## Instalación & Configuración

### Requisitos Previos

- PHP 8.2+
- Composer
- Laravel 11
- MySQL 8.0+ o PostgreSQL 12+
- Node.js 18+ (para assets)

### Pasos de Instalación

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/JonathanAfanador/ObservatorioFront.git
cd theftp
```

#### 2. Instalar Dependencias PHP
```bash
composer install
```

#### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
php artisan key:generate
```

Configurar en `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=observatorio
DB_USERNAME=root
DB_PASSWORD=
```

#### 4. Migrar Base de Datos
```bash
php artisan migrate
```

#### 5. Ejecutar Seeders
```bash
php artisan db:seed
# O específicamente:
php artisan db:seed --class=UpcRoleSeeder
```

#### 6. Instalar Assets Frontend
```bash
npm install
npm run dev
```

#### 7. Iniciar Servidor
```bash
php artisan serve
```

El sistema estará disponible en `http://localhost:8000`

### Verificación

**Listar rutas API:**
```bash
php artisan route:list | grep api
```

**Verificar roles:**
```bash
php artisan tinker
>>> App\Models\Role::all();
```

---

## Cambios Principales

### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `app/Http/Controllers/AuthController.php` | Auth logic (login, register) |
| `app/Http/Controllers/ReportesController.php` | Report generation (CSV exports) |
| `app/Http/Controllers/EstadisticasController.php` | Statistics endpoints (UPC) |
| `app/Http/Controllers/SecretariaController.php` | Statistics endpoints (Secretaría) - NUEVO |
| `app/Enums/Reportes.php` | Report type enum |
| `resources/views/auth/role-selection.blade.php` | Unified login page |
| `resources/views/auth/register.blade.php` | Registration page |
| `resources/views/dashboard/upc.blade.php` | UPC dashboard |
| `resources/views/dashboard/secretaria.blade.php` | Secretaría dashboard - NUEVO |
| `database/seeders/UpcRoleSeeder.php` | UPC role + permissions seed |
| `database/seeders/SecretariaRoleSeeder.php` | Secretaría role + permissions seed - NUEVO |
| `database/migrations/...` | Empresa table modifications |
| `routes/api.php` | API routes (auth, reportes, stats, secretaria) |
| `docs/IMPLEMENTATION.md` | Este documento |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `routes/web.php` | `/login` → role-selection, `/registro` → register, `/dashboard/secretaria` (NUEVO) |
| `routes/api.php` | Rutas de Secretaría agregadas (endpoints estadísticas) |
| `resources/views/layouts/landing.blade.php` | Simplificado para auth pages |
| `resources/views/components/landing/header.blade.php` | Links actualizados a `/login` y `/registro` |
| `.env.example` | (si aplica) Sanctum config |

### Archivos Eliminados

| Archivo | Razón |
|---------|-------|
| `resources/views/auth/upc-login.blade.php` | Consolidado en role-selection |
| `resources/views/auth/upc-register.blade.php` | Consolidado en register |
| Rutas específicas por rol | Consolidadas en rutas unificadas |

---

## Testing

### Test de Login

```bash
# Usando Postman o curl:
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "upc@test.com",
    "password": "password123",
    "role": "UPC"
  }'
```

### Test de Reportes

```bash
# Obtener token primero, luego:
curl -X GET http://localhost:8000/api/reportes/empresas \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test de Dashboard

1. Abrir `http://localhost:8000/login` en navegador
2. Seleccionar UPC
3. Usar credenciales test
4. Verificar que carga `/dashboard/upc`
5. Hacer clic en botones de reporte
6. Verificar descarga de CSV

---

## Consideraciones de Seguridad

✅ **Implementado:**
- Token-based auth con Laravel Sanctum
- Validación de email único
- Hashing de contraseñas (bcrypt)
- CSRF protection en formularios
- Role-based access control (RBAC)

⚠️ **Recomendaciones:**
- Usar HTTPS en producción
- Implementar rate limiting en `/api/auth/login`
- Agregar 2FA (Two-Factor Authentication) para UPC
- Auditar accesos a reportes (log descargas)
- Rotar token periodicamente (token expiry)

---

## Próximos Pasos

### Mejoras Futuras
1. **Autenticación Avanzada**
   - OAuth 2.0 (integración con proveedores)
   - 2FA y WebAuthn
   
2. **Reportes Mejorados**
   - Exportación a Excel/PDF
   - Filtros avanzados
   - Programación de reportes automáticos
   
3. **Dashboard Expandido**
   - Gráficos interactivos
   - Mapas de rutas en tiempo real
   - Alertas y notificaciones
   
4. **Auditoría**
   - Log de todas las acciones
   - Trail de cambios en datos
   - Exportación de auditoría

5. **Integración de Otros Roles**
   - Dashboard Empresa
   - Dashboard Secretaría
   - Permisos específicos por rol

---

## Referencias

- **Laravel Documentation:** https://laravel.com/docs
- **Laravel Sanctum:** https://laravel.com/docs/sanctum
- **Bootstrap 5:** https://getbootstrap.com
- **Font Awesome:** https://fontawesome.com

---

## Soporte

Para reportar issues o sugerencias:
- Email: development@observatorio.local
- GitHub Issues: https://github.com/JonathanAfanador/ObservatorioFront/issues

---

**Última actualización:** Noviembre 15, 2025  
**Autor:** Desarrollo - Semillero Observatorio  
**Rama:** `cambios_erick`
