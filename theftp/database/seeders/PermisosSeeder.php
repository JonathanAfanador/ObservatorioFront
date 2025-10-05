<?php
//! Al final :V
namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class PermisosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tablas de las cuales quiero que tengan permisos
        $collection = collect([
            // ------- Espacial ------- //
            'rutas',
            'barrios',
            'municipios',
            'departamentos',

            // ------- Auth ------- //
            'personas',
            'tipo_ident',
            'usuarios',
            'rol',
            'roles_menus',
            'menus',
            'permisos',

            // ------- Transporte publico ------- //
            'tipo_empresa',
            'empresas',
            'empresa_usuarios',
            'conductores',
            'licencias',
            'conductores_licencias',
            'restriccion_lic',
            'categorias_licencia',
            'propietarios',
            'documentos',
            'tipo_doc',
            'tipo_vehiculo',
            'vehiculo',
            'seguim_gps',
            'seguim_estado_veh',

            // ------- Auditoria ------- //
            'inicio_sesion',
            'cierre_sesion',
        ]);

        $roles = DB::table('rol')->pluck('id', 'descripcion');
        $rol_map = [];
        foreach ($roles as $r){
            $rol_map[mb_strtoupper(trim($r->descripcion))] = (int) $r->id;
        }

        // Helpers de politicas
        $NONE = ['agregar' => false, 'mordificar' => false, 'eliminar' => false, 'leer' => false];
        $CRUD = ['agregar' => true, 'mordificar' => true, 'eliminar' => true, 'leer' => true];
        $CRU = ['agregar' => true, 'mordificar' => true, 'eliminar' => false, 'leer' => true];
        $READONLY = ['agregar' => false, 'mordificar' => false, 'eliminar' => false, 'leer' => true];

        // Politicas por rol
        // Uso de Mayusculas para coincidir con $rol_map
        $POLICIES = [
            'ADMINISTRADOR' => [
                '*' => $CRUD, // Todos los permisos
            ],


            // Operativo de Transito: CRUD en dominio, solo lectura en catalogo y seguridad
            'SECRETARIA_DE_TRANSITO' => [
                    '*' => $NONE,
                    // Dominio tránsito (CRUD)
                    'vehiculo'=>$CRUD,'tipo_vehiculo'=>$CRUD,'conductores'=>$CRUD,'licencias'=>$CRUD,
                    'conductores_licencias'=>$CRUD,'categorias_licencia'=>$CRUD,'restriccion_lic'=>$CRUD,
                    'empresas'=>$CRUD,'empresa_usuarios'=>$CRUD,'tipo_empresa'=>$CRUD,
                    'seguim_gps'=>$CRUD,'seguim_estado_veh'=>$CRUD,'documentos'=>$CRUD,'tipo_doc'=>$CRUD,
                    // Catálogos y seguridad (solo lectura)
                    'departamentos'=>$READONLY,'municipios'=>$READONLY,'barrios'=>$READONLY,
                    'usuarios'=>$READONLY,'rol'=>$READONLY,'permisos'=>$READONLY,'menus'=>$READONLY,'roles_menus'=>$READONLY,
            ],

            // Empresa de transporte: puede crear/editar su operación, sin eliminar; lectura del resto
            'EMPRESA_TRANSPORTE' => [
                    '*' => $NONE,
                    'vehiculo'=>$CRU,'conductores'=>$CRU,'licencias'=>$CRU,'documentos'=>$CRU,
                    // Lecturas
                    'seguim_gps'=>$READONLY,'seguim_estado_veh'=>$READONLY,
                    'departamentos'=>$READONLY,'municipios'=>$READONLY,'barrios'=>$READONLY,
                    'tipo_vehiculo'=>$READONLY,'categorias_licencia'=>$READONLY,'restriccion_lic'=>$READONLY,
                    'tipo_doc'=>$READONLY,'empresas'=>$READONLY,'tipo_empresa'=>$READONLY,
            ],

            // Usuario UPC: crear (reportes si aplica) y leer catálogos
            'USUARIO_UPC' => [
                    '*' => $NONE,
                    // Si manejas reportes: 'reportes_ciudadanos'=>$CRU,
                    'departamentos'=>$READONLY,'municipios'=>$READONLY,'barrios'=>$READONLY,
            ],

            // Invitado: solo lectura básica de catálogos
            'INVITADO' => [
                    '*' => $NONE,
                    'departamentos'=>$READONLY,'municipios'=>$READONLY,'barrios'=>$READONLY,
            ],
        ];

        // Construir filas para upsert
        $rows = [];
        foreach ($POLICIES as $rolNombre => $policy) {
            if (!isset($rol_map[$rolNombre])) {
                // Si el rol no existe, saltar silenciosamente
                continue;
            }
            $rolId = $rol_map[$rolNombre];
            $default = $policy['*'] ?? $NONE;

            foreach ($collection as $tabla) {
                $permisos = $policy[$tabla] ?? $default;
                $rows[] = [
                    'tabla'=> $tabla,
                    'agregar' => $permisos['agregar'],
                    'mordificar' => $permisos['mordificar'],
                    'eliminar' => $permisos['eliminar'],
                    'leer' => $permisos['leer'],
                ];
            }
        }
        if (empty($rows)) {
            return; // No hay datos para insertar
        }

        DB::table('permisos')->upsert($rows, ['tabla', 'rol_id'], ['agregar', 'mordificar', 'eliminar', 'leer']);
    }
}
