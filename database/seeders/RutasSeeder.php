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

        $empresa = DB::table('empresas')->first();

        if (!$empresa) {
            $this->command->info('RutasSeeder: faltan empresas. Saltando.');
            return;
        }

        DB::table('rutas')->insert([
            [
                'name' => 'Ruta Centro - Norte',
                'file_name' => 'ruta_centro_norte.kml',
                'empresa_id' => $empresa->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ruta Centro - Sur',
                'file_name' => 'ruta_centro_sur.kml',
                'empresa_id' => $empresa->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->command->info('RutasSeeder: insertadas rutas de ejemplo.');
    }
}
