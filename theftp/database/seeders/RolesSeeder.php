<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $array = [
            ['descripcion' => 'Administrador'],
            ['descripcion' => 'Secretaria de tránsito'],
            ['descripcion' => 'Empresa de transporte'],
            ['descripcion' => 'UPC'],
            ['descripcion' => 'Invitado']
        ];

        DB::table('rol')->insert($array);
    }
}
