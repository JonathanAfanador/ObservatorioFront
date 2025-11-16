<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SecretariaRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Crea permisos CRUD para Secretaría en todas las tablas excepto auditoría
     */
    public function run(): void
    {
        // Primero verificar si la tabla 'rol' ya tiene un registro para 'Secretaría'
        $secretariaExists = DB::table('rol')
            ->where('descripcion', 'Secretaria de tránsito')
            ->exists();

        if (!$secretariaExists) {
            DB::table('rol')->insert([
                'descripcion' => 'Secretaria de tránsito',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Obtener el ID del rol Secretaría
        $secretariaRol = DB::table('rol')
            ->where('descripcion', 'Secretaria de tránsito')
            ->first();

        if (!$secretariaRol) {
            return; // Si no existe, salir
        }

        // Lista de tablas para las que Secretaría tiene permisos CRUD
        $tables = [
            'municipios',
            'departamentos',
            'barrios',
            'tipo_ident',
            'tipo_doc',
            'documentos',
            'categorias_licencia',
            'restriccion_lic',
            'licencias',
            'personas',
            'users',
            'tipo_empresa',
            'empresas',
            'rutas',
            'conductores',
            'tipo_vehiculo',
            'propietarios',
            'vehiculos',
            'conductores_licencias',
            'seguim_gps',
            'seguim_estado_veh',
            'permisos',
            'rol',
            'menus',
            'roles_menus'
        ];

        // Crear permisos CRUD para cada tabla
        foreach ($tables as $table) {
            // Verificar si el permiso ya existe para esta tabla y rol
            $permisoExists = DB::table('permisos')
                ->where('tabla', $table)
                ->where('rol_id', $secretariaRol->id)
                ->exists();

            if (!$permisoExists) {
                DB::table('permisos')->insert([
                    'tabla' => $table,
                    'create' => true,
                    'read' => true,
                    'update' => true,
                    'delete' => true,
                    'rol_id' => $secretariaRol->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        $this->command->info('Permisos de Secretaría creados exitosamente.');
    }
}
