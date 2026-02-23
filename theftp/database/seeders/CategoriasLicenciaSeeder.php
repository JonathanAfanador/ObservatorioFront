<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CategoriasLicenciaSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        if (DB::table('categorias_licencia')->count() > 0) {
            $this->command->info('CategoriasLicenciaSeeder: ya existen registros. Saltando.');
            return;
        }

        DB::table('categorias_licencia')->insert([
            ['codigo' => 'A', 'descripcion' => 'Vehículos particulares ligeros', 'created_at' => $now, 'updated_at' => $now],
            ['codigo' => 'B', 'descripcion' => 'Vehículos de servicio público',     'created_at' => $now, 'updated_at' => $now],
            ['codigo' => 'C', 'descripcion' => 'Vehículos de carga pesada',        'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('CategoriasLicenciaSeeder: insertadas categorías de licencia.');
    }
}
