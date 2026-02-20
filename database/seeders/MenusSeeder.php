<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Exception;

class MenusSeeder extends Seeder
{
    public function run(): void
    {
        $table = 'menus';
        if (DB::table($table)->count() > 0) {
            $this->command?->info("MenusSeeder: tabla '$table' no vacía — saltando.");
            return;
        }

        // Verificar si existe columna padre_id y si es nullable
        $col = DB::selectOne("
            SELECT is_nullable
            FROM information_schema.columns
            WHERE table_name = ? AND column_name = 'padre_id'
        ", [ $table ]);

        $padreNullable = $col && ($col->is_nullable === 'YES');

        $rows = [
            ['name' => 'Inicio',     'icon' => 'fa-home', 'url' => '/inicio',   'padre_id' => null],
            ['name' => 'Empresas',   'icon' => 'fa-building', 'url' => '/empresas', 'padre_id' => null],
            ['name' => 'Usuarios',   'icon' => 'fa-users', 'url' => '/users',    'padre_id' => null],
            ['name' => 'Reportes',   'icon' => 'fa-file', 'url' => '/reportes',  'padre_id' => null],
        ];

        DB::beginTransaction();
        try {
            if ($padreNullable) {
                // Normal: padre_id permite NULL
                DB::table($table)->insert($rows);
                // crear submenú para el primer registro
                $firstId = DB::table($table)->where('name', 'Inicio')->value('id');
                if ($firstId) {
                    DB::table($table)->insert([
                        ['name' => 'Panel de control', 'icon' => 'fa-tachometer-alt', 'url' => '/inicio/panel', 'padre_id' => $firstId],
                    ]);
                }
            } else {
                // padre_id NO permite NULL -> intentamos inserción temporalmente deshabilitando triggers (solo en dev)
                $this->command?->info("MenusSeeder: 'padre_id' NO es nullable. Intentando inserción deshabilitando triggers (dev).");
                try {
                    DB::statement("ALTER TABLE {$table} DISABLE TRIGGER ALL");
                } catch (Exception $e) {
                    // Si no se puede, abortar y notificar
                    DB::rollBack();
                    $this->command?->error("MenusSeeder: no se puede deshabilitar triggers para '$table'. Revisa permisos o ajusta esquema (hacer padre_id nullable o establecer un root existente). Error: " . $e->getMessage());
                    return;
                }

                // Insertar con padre_id NULL (los triggers/constraints están deshabilitados temporalmente)
                DB::table($table)->insert($rows);
                $firstId = DB::table($table)->where('name', 'Inicio')->value('id');
                if ($firstId) {
                    DB::table($table)->insert([
                        ['name' => 'Panel de control', 'icon' => 'fa-tachometer-alt', 'url' => '/inicio/panel', 'padre_id' => $firstId],
                    ]);
                }

                // Reactivar triggers
                DB::statement("ALTER TABLE {$table} ENABLE TRIGGER ALL");
            }

            DB::commit();
            $this->command?->info("MenusSeeder: insertados menús de ejemplo.");
        } catch (Exception $e) {
            DB::rollBack();
            $this->command?->error("MenusSeeder: error al insertar: " . $e->getMessage());
        }
    }
}
