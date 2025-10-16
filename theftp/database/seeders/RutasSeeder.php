<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RutasSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $municipio = DB::table('municipios')->first();
        $empresa = DB::table('empresas')->first();

        if (!$municipio || !$empresa) {
            $this->command->info('RutasSeeder: faltan municipios o empresas. Saltando.');
            return;
        }

        DB::table('rutas')->insert([
            [
                'name' => 'Ruta Centro - Norte',
                'file_name' => 'ruta_centro_norte.kml',
                'municipios_id' => $municipio->id,
                'empresa_id' => $empresa->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ruta Centro - Sur',
                'file_name' => 'ruta_centro_sur.kml',
                'municipios_id' => $municipio->id,
                'empresa_id' => $empresa->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->command->info('RutasSeeder: insertadas rutas de ejemplo.');
    }
}
