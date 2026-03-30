<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void{

        $this->call([
            // ─── Tablas base (sin dependencias) ───────────────────────────
            DepartamentosSeeder::class,        // departamentos
            MunicipiosSeeder::class,           // municipios   → departamentos
            BarriosSeeder::class,              // barrios      → municipios
            TipoDocSeeder::class,              // tipo_doc
            TipoEmpresaSeeder::class,          // tipo_empresa
            TipoIndentSeeder::class,           // tipo_ident
            RolesSeeder::class,                // rol

            // ─── Documentos (requiere tipo_doc) ───────────────────────────
            DocumentosSeeder::class,           // documentos   → tipo_doc

            // ─── Entidades principales ────────────────────────────────────
            PersonasSeeder::class,             // personas     → tipo_ident
            EmpresaSeeder::class,              // empresas     → tipo_empresa

            // ─── Usuarios (requiere personas + rol + empresas) ────────────
            UserSeeder::class,                 // users        → personas, rol, empresas
            EmpresaUsuarioSeeder::class,       // empresa_usuario → empresas, users

            // ─── Rutas (requiere empresas) ────────────────────────────────
            RutasSeeder::class,                // rutas        → empresas

            // ─── Propietarios y Vehículos ─────────────────────────────────
            TipoVehiculoSeeder::class,         // tipo_vehiculo
            PropietariosSeeder::class,         // propietarios → documentos
            VehiculoSeeder::class,             // vehiculo     → propietarios, tipo_vehiculo

            // ─── Conductores ──────────────────────────────────────────────
            ConductoresSeeder::class,          // conductores  → personas

            // ─── Licencias ────────────────────────────────────────────────
            RestriccionLicSeeder::class,       // restriccion_lic
            CategoriasLicenciaSeeder::class,   // categorias_licencia
            LicenciasSeeder::class,            // licencias    → restriccion_lic, categorias_licencia, documentos
            ConductoresLicenciasSeeder::class, // conductores_licencias → conductores, licencias

            // ─── Permisos y Menús ─────────────────────────────────────────
            PermisosSeeder::class,             // permisos
            MenusSeeder::class,                // menus
            RolesMenusSeeder::class,           // roles_menus  → rol, menus

            // ─── Seguimiento (requiere vehiculo) ──────────────────────────
            SeguimEstadoVehSeeder::class,      // seguim_estado_veh → vehiculo
            SeguimGpsSeeder::class,            // seguim_gps → vehiculo
        ]);

    }
}
