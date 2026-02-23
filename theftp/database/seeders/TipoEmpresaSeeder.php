<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoEmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $array = [
            ['descripcion' => 'Pública'],
            ['descripcion' => 'Privada'],
            ['descripcion' => 'Mixta'],
            ['descripcion' => 'Cooperativa'],
            ['descripcion' => 'Comunitaria'],
            ['descripcion' => 'Otra'],
        ];

        DB::table('tipo_empresa')->insert($array);
    }
}
