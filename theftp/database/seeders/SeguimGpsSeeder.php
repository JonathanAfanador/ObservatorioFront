<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class SeguimGpsSeeder extends Seeder
{
    public function run(): void
    {
        $table = 'seguim_gps';
        if (DB::table($table)->count() > 0) {
            if (isset($this->command)) $this->command->info("SeguimGpsSeeder: tabla '$table' no vacía — saltando.");
            return;
        }

        $vehiculos = DB::table('vehiculo')->pluck('id')->all();
        if (empty($vehiculos)) {
            if (isset($this->command)) $this->command->info("SeguimGpsSeeder: faltan 'vehiculo' — saltando.");
            return;
        }

        $faker = Faker::create('es_CO');
        $rows = [];
        $n = 5;
        for ($i = 0; $i < $n; $i++) {
            $rows[] = [
                'fecha_hora' => now()->subMinutes(rand(0, 10000))->toDateTimeString(),
                'vehiculo_id' => $vehiculos[array_rand($vehiculos)],
                'latitud' => $faker->latitude( -4.0, 12.0 ),   // rango Colombia-ish
                'longitud' => $faker->longitude(-80.0, -66.0),
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        DB::table($table)->insert($rows);
        if (isset($this->command)) $this->command->info("SeguimGpsSeeder: insertadas $n filas de seguimiento GPS.");
    }
}
