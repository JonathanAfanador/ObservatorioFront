<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ConductoresSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $persona = DB::table('personas')->first();

        if (!$persona) {
            $this->command->info('ConductoresSeeder: faltan personas. Saltando.');
            return;
        }

        DB::table('conductores')->insert([
            [
                'persona_id' => $persona->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // Si quieres más conductores, duplica o busca otras personas.
        ]);

        $this->command->info('ConductoresSeeder: insertados conductores de ejemplo.');
    }
}
