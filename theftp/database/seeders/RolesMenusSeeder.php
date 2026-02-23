<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesMenusSeeder extends Seeder
{
    public function run(): void
    {
        $table = 'roles_menus';
        if (DB::table($table)->count() > 0) {
            if (isset($this->command)) $this->command->info("RolesMenusSeeder: tabla '$table' no vacía — saltando.");
            return;
        }

        // Obtener roles y menus disponibles
        $roles = DB::table('rol')->pluck('id')->all();
        $menus = DB::table('menus')->pluck('id')->all();

        if (empty($roles) || empty($menus)) {
            if (isset($this->command)) $this->command->info("RolesMenusSeeder: faltan 'rol' o 'menus' — saltando.");
            return;
        }

        $pairs = [];
        // Crearemos hasta 5 asociaciones (combinaciones aleatorias)
        $n = min(5, count($roles) * count($menus));
        $used = [];
        $i = 0;
        while ($i < $n) {
            $r = $roles[array_rand($roles)];
            $m = $menus[array_rand($menus)];
            $key = $r . '_' . $m;
            if (isset($used[$key])) continue;
            $used[$key] = true;
            $pairs[] = ['rol_id' => $r, 'menu_id' => $m];
            $i++;
        }

        DB::table($table)->insert($pairs);
        if (isset($this->command)) $this->command->info("RolesMenusSeeder: insertadas " . count($pairs) . " relaciones rol↔menu.");
    }
}
