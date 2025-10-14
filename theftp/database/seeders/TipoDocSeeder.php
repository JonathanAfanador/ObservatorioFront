<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoDocSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $array = [
            ['descripcion' => 'PDF'],
            ['descripcion' => 'Excel'],
            ['descripcion' => 'CSV'],
            ['descripcion' => 'Documento Word'],
            ['descripcion' => 'Presentación'],
            ['descripcion' => 'Imagen (JPG/PNG)'],
            ['descripcion' => 'GeoJSON'],
            ['descripcion' => 'KML'],
            ['descripcion' => 'Audio'],
            ['descripcion' => 'Video'],
        ];

        DB::table('tipo_doc')->insert($array);
    }
}
