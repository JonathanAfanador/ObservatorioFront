<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Enums\Tablas;

class PermisosSeeder extends Seeder
{
    public function run()
    {
        $tablas = Tablas::getValues(); // enum -> array de strings
        $now = Carbon::now();

        // roles por ID (según lo que mencionaste)
        // 1 => Administrador
        // 2 => Secretaria de tránsito
        // 3 => Empresa de transporte
        // 4 => Usuario UPC
        // 5 => Invitado

        $roleIds = [1,2,3,4,5];

        foreach ($roleIds as $roleId) {

            // validar que exista el rol en BD, si no existe lo saltamos
            $rolExists = DB::table('rol')->where('id', $roleId)->exists();
            if (! $rolExists) {
                $this->command->info("PermisosSeeder: rol id={$roleId} no existe en tabla 'rol'. Saltando ese rol.");
                continue;
            }

            foreach ($tablas as $tabla) {
                // default
                $create = false;
                $read   = false;
                $update = false;
                $delete = false;

                if ($roleId === 1) {
                    // Administrador: todo true
                    $create = $read = $update = $delete = true;
                } elseif ($roleId === 2) {
                    // Secretaria de tránsito: igual que admin pero auditoria todo FALSE
                    if ($tabla === Tablas::AUDITORIA->value) {
                        $create = $read = $update = $delete = false;
                    } else {
                        $create = $read = $update = $delete = true;
                    }
                } elseif ($roleId === 3) {
                    // Empresa de transporte
                    // read true en todas menos auditoria
                    $read = ($tabla !== Tablas::AUDITORIA->value);

                    // create/update true por defecto salvo excepciones
                    $isTipo = str_contains($tabla, 'tipo'); // tipo_doc, tipo_ident, tipo_vehiculo...
                    $isException = in_array($tabla, [
                        Tablas::AUDITORIA->value,
                        Tablas::EMPRESAS->value,
                    ]) || $isTipo || in_array($tabla, ['categorias_licencias','restriccion_lic']);

                    if ($isException) {
                        $create = $update = false;
                    } else {
                        $create = $update = true;
                    }

                    // delete desactivado
                    $delete = false;
                } elseif (in_array($roleId, [4,5])) {
                    // Usuario UPC e Invitado: ver todas menos auditoria
                    $read = ($tabla !== Tablas::AUDITORIA->value);
                    $create = $update = $delete = false;
                } else {
                    // default seguro: solo lectura excepto auditoria
                    $read = ($tabla !== Tablas::AUDITORIA->value);
                }

                // Inserción idempotente: updateOrInsert por rol+tabla
                DB::table('permisos')->updateOrInsert(
                    [
                        'rol_id' => $roleId,
                        'tabla'  => $tabla,
                    ],
                    [
                        'create' => (bool)$create,
                        'read'   => (bool)$read,
                        'update' => (bool)$update,
                        'delete' => (bool)$delete,
                        'updated_at' => $now,
                        'created_at' => DB::table('permisos')->where('rol_id', $roleId)->where('tabla', $tabla)->exists()
                            ? DB::raw('created_at') : $now,
                    ]
                );
            } // end foreach tablas

            $this->command->info("PermisosSeeder: procesado rol id={$roleId}.");
        } // end foreach roles

        $this->command->info("PermisosSeeder: terminado.");
    }
}
