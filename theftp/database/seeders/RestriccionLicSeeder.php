<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RestriccionLicSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        if (DB::table('restriccion_lic')->count() > 0) {
            $this->command->info('RestriccionLicSeeder: ya existen registros. Saltando.');
            return;
        }

        DB::table('restriccion_lic')->insert([
            ['descripcion' => 'Sin restricciones',   'created_at' => $now, 'updated_at' => $now],
            ['descripcion' => 'Restricción horaria', 'created_at' => $now, 'updated_at' => $now],
            ['descripcion' => 'Solo carga',         'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('RestriccionLicSeeder: insertadas restricciones de licencia.');
    }
}
