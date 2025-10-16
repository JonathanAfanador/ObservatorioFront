<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class VehiculoSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $propietario = DB::table('propietarios')->first();
        $tipoVeh = DB::table('tipo_vehiculo')->first();

        if (!$propietario || !$tipoVeh) {
            $this->command->info('VehiculoSeeder: faltan propietarios o tipo_vehiculo. Saltando.');
            return;
        }

        DB::table('vehiculo')->insert([
            [
                'color' => 'Blanco',
                'marca' => 'Chevrolet',
                'placa' => 'ABC123',
                'modelo' => '2015',
                'servicio' => true,
                'propietario_id' => $propietario->id,
                'tipo_veh_id' => $tipoVeh->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'color' => 'Rojo',
                'marca' => 'Nissan',
                'placa' => 'XYZ789',
                'modelo' => '2018',
                'servicio' => false,
                'propietario_id' => $propietario->id,
                'tipo_veh_id' => $tipoVeh->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->command->info('VehiculoSeeder: insertados vehículos de ejemplo.');
    }
}
