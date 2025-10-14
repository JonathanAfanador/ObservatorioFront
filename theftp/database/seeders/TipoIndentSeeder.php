<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoIndentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['descripcion' => 'CÉDULA DE CIUDADANÍA'],
            ['descripcion' => 'CÉDULA DE EXTRANJERÍA'],
            ['descripcion' => 'TARJETA DE IDENTIDAD'],
            ['descripcion' => 'REGISTRO CIVIL'],
            ['descripcion' => 'NIT'],
            ['descripcion' => 'PASAPORTE'],
            ['descripcion' => 'PERMISO ESPECIAL DE PERMANENCIA'],
            ['descripcion' => 'SIN IDENTIFICACIÓN'],
        ];

        DB::table('tipo_ident')->insert($tipos);
    }
}
