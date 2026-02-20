<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class SeguimEstadoVehSeeder extends Seeder
{
    public function run(): void
    {
        $table = 'seguim_estado_veh';
        if (DB::table($table)->count() > 0) {
            $this->command?->info("SeguimEstadoVehSeeder: tabla '$table' no vacía — saltando.");
            return;
        }

        // columnas disponibles
        $cols = DB::getSchemaBuilder()->getColumnListing($table);
        $hasRuta = in_array('ruta_id', $cols);

        $users = DB::table('users')->pluck('id')->all();
        $vehiculos = DB::table('vehiculo')->pluck('id')->all();
        $rutas = $hasRuta ? DB::table('rutas')->pluck('id')->all() : [];

        if (empty($users) || empty($vehiculos) || ($hasRuta && empty($rutas))) {
            $this->command?->info("SeguimEstadoVehSeeder: faltan 'users' o 'vehiculo' " . ($hasRuta ? "o 'rutas' " : "") . " — saltando.");
            return;
        }

        $faker = Faker::create('es_CO');
        $rows = [];
        for ($i = 0; $i < 5; $i++) {
            $row = [
                'kilometraje' => $faker->numberBetween(1000, 300000),
                'fecha_hora' => now()->subDays(rand(0, 30))->toDateTimeString(),
                'observaciones' => $faker->sentence(6),
                'usuario_id' => $users[array_rand($users)],
                'vehiculo_id' => $vehiculos[array_rand($vehiculos)],
                'created_at' => now(),
                'updated_at' => now()
            ];
            if ($hasRuta) {
                $row['ruta_id'] = $rutas[array_rand($rutas)];
            }
            $rows[] = $row;
        }

        DB::table($table)->insert($rows);
        $this->command?->info("SeguimEstadoVehSeeder: insertadas " . count($rows) . " filas.");
    }
}
