<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartamentosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $array = [
            ['name' => 'TOTAL NACIONAL',   'codigo_dane' => '00'],
            ['name' => 'ANTIOQUIA',        'codigo_dane' => '05'],
            ['name' => 'ATLANTICO',        'codigo_dane' => '08'],
            ['name' => 'BOGOTA',           'codigo_dane' => '11'],
            ['name' => 'BOLIVAR (1)',      'codigo_dane' => '13'],
            ['name' => 'BOYACA',           'codigo_dane' => '15'],
            ['name' => 'CALDAS',           'codigo_dane' => '17'],
            ['name' => 'CAQUETA',          'codigo_dane' => '18'],
            ['name' => 'CAUCA (1)',        'codigo_dane' => '19'],
            ['name' => 'CESAR',            'codigo_dane' => '20'],
            ['name' => 'CORDOBA (1), (3)','codigo_dane' => '23'],
            ['name' => 'CUNDINAMARCA',     'codigo_dane' => '25'],
            ['name' => 'CHOCO (2)',        'codigo_dane' => '27'],
            ['name' => 'HUILA',            'codigo_dane' => '41'],
            ['name' => 'LA GUAJIRA',       'codigo_dane' => '44'],
            ['name' => 'MAGDALENA',        'codigo_dane' => '47'],
            ['name' => 'META',             'codigo_dane' => '50'],
            ['name' => 'NARIÑO',           'codigo_dane' => '52'],
            ['name' => 'N. DE SANTANDER',  'codigo_dane' => '54'],
            ['name' => 'QUINDIO',          'codigo_dane' => '63'],
            ['name' => 'RISARALDA',        'codigo_dane' => '66'],
            ['name' => 'SANTANDER',        'codigo_dane' => '68'],
            ['name' => 'SUCRE',            'codigo_dane' => '70'],
            ['name' => 'TOLIMA',           'codigo_dane' => '73'],
            ['name' => 'VALLE DEL CAUCA',  'codigo_dane' => '76'],
            ['name' => 'ARAUCA',           'codigo_dane' => '81'],
            ['name' => 'CASANARE',         'codigo_dane' => '85'],
            ['name' => 'PUTUMAYO',         'codigo_dane' => '86'],
            ['name' => 'SAN ANDRES',       'codigo_dane' => '88'],
            ['name' => 'AMAZONAS',         'codigo_dane' => '91'],
            ['name' => 'GUAINIA',          'codigo_dane' => '94'],
            ['name' => 'GUAVIARE',         'codigo_dane' => '95'],
            ['name' => 'VAUPES',           'codigo_dane' => '97'],
            ['name' => 'VICHADA',          'codigo_dane' => '99'],
        ];

        DB::table('departamentos')->insert($array);
    }
}
