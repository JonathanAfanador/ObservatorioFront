<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentosSeeder extends Seeder
{
    public function run(): void
    {
        // Traer tipos de documento existentes (id y descripción)
        $tipos = DB::table('tipo_doc')->get(['id','descripcion'])->all();
        if (empty($tipos)) {
            throw new \RuntimeException("La tabla 'tipo_doc' está vacía. Corre primero TipoDocSeeder.");
        }

        $faker = \Faker\Factory::create('es_CO');
        $now   = now();

        // Mapeo simple descripción -> extensiones posibles
        $extMap = [
            'PDF'                     => ['pdf'],
            'EXCEL'                   => ['xlsx', 'xls'],
            'CSV'                     => ['csv'],
            'DOCUMENTO WORD'          => ['docx', 'doc'],
            'PRESENTACIÓN'            => ['pptx', 'ppt'],
            'IMAGEN (JPG/PNG)'        => ['jpg', 'png'],
            'GEOJSON'                 => ['geojson'],
            'KML'                     => ['kml'],
            'AUDIO'                   => ['mp3', 'wav'],
            'VIDEO'                   => ['mp4', 'mov'],
        ];

        $makeUrl = function (string $ext): string {
            $ym = date('Y/m');
            return "documentos/{$ym}/" . Str::uuid() . ".{$ext}";
        };

        $rows = [];

        // 1) Un documento por cada tipo (asegura cobertura)
        foreach ($tipos as $t) {
            $key  = mb_strtoupper($t->descripcion);
            $exts = $extMap[$key] ?? ['dat'];
            $ext  = $exts[array_rand($exts)];

            $rows[] = [
                'url'           => $makeUrl($ext),
                'observaciones' => $faker->sentence(8),
                'tipo_doc_id'   => (int) $t->id,
                'created_at'    => null,
                'updated_at'    => null,
                'deleted_at'    => null,
            ];
        }

        // 2) Extras aleatorios
        for ($i = 0; $i < 20; $i++) {
            $t    = $tipos[array_rand($tipos)];
            $key  = mb_strtoupper($t->descripcion);
            $exts = $extMap[$key] ?? ['dat'];
            $ext  = $exts[array_rand($exts)];

            $rows[] = [
                'url'           => $makeUrl($ext),
                'observaciones' => $faker->realText(80),
                'tipo_doc_id'   => (int) $t->id,
                'created_at'    => $now,
                'updated_at'    => $now,
                'deleted_at'    => null,
            ];
        }

        DB::table('documentos')->insert($rows);
    }
}
