<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ConductoresLicenciasSeeder extends Seeder
{
    public function run(): void
    {
        $table = 'conductores_licencias';
        if (DB::table($table)->count() > 0) {
            if (isset($this->command)) $this->command->info("ConductoresLicenciasSeeder: tabla '$table' no vacía — saltando.");
            return;
        }

        $conductores = DB::table('conductores')->pluck('id')->all();
        $licencias = DB::table('licencias')->pluck('id')->all();

        if (empty($conductores) || empty($licencias)) {
            if (isset($this->command)) $this->command->info("ConductoresLicenciasSeeder: faltan 'conductores' o 'licencias' — saltando.");
            return;
        }

        $faker = Faker::create('es_CO');
        $pairs = [];
        $used = [];
        $target = min(10, count($conductores) * count($licencias));
        $i = 0;
        while ($i < $target) {
            $c = $conductores[array_rand($conductores)];
            $l = $licencias[array_rand($licencias)];
            $key = $c . '_' . $l;
            if (isset($used[$key])) continue;
            $used[$key] = true;
            $pairs[] = ['conductor_id' => $c, 'licencia_id' => $l, 'created_at' => now(), 'updated_at' => now()];
            $i++;
        }

        DB::table($table)->insert($pairs);
        if (isset($this->command)) $this->command->info("ConductoresLicenciasSeeder: insertadas " . count($pairs) . " relaciones conductor↔licencia.");
    }
}
