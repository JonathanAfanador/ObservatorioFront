<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class LicenciasSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $restric = DB::table('restriccion_lic')->first();
        $categoria = DB::table('categorias_licencia')->first();
        $documento = DB::table('documentos')->first();

        if (!$restric || !$categoria || !$documento) {
            $this->command->info('LicenciasSeeder: faltan restriccion_lic, categorias_licencia o documentos. Saltando.');
            return;
        }

        DB::table('licencias')->insert([
            [
                'restriccion_lic_id' => $restric->id,
                'categoria_lic_id' => $categoria->id,
                'documento_id' => $documento->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // Ejemplo adicional:
            [
                'restriccion_lic_id' => $restric->id,
                'categoria_lic_id' => $categoria->id,
                'documento_id' => $documento->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->command->info('LicenciasSeeder: insertadas licencias de ejemplo.');
    }
}
