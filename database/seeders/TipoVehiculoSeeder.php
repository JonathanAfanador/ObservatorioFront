<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class TipoVehiculoSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        // Si ya hay datos no insertar de nuevo
        if (DB::table('tipo_vehiculo')->count() > 0) {
            $this->command->info('TipoVehiculoSeeder: ya existen registros. Saltando.');
            return;
        }

        DB::table('tipo_vehiculo')->insert([
            ['descripcion' => 'Bus',      'capacidad' => 50, 'created_at' => $now, 'updated_at' => $now],
            ['descripcion' => 'Microbus', 'capacidad' => 25, 'created_at' => $now, 'updated_at' => $now],
            ['descripcion' => 'Taxi',     'capacidad' => 4,  'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('TipoVehiculoSeeder: insertados tipos de vehículo.');
    }
}
