<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    const ID_TIPO_EMPRESA_PUBLICA = 1;

    public function run(): void
    {
        // 1) Empresas PÚBLICAS base (no cambiar atributos)
        $base = [
            ['nit' => '123456', 'name' => 'Atanasio Girardot', 'tipo_empresa_id' => self::ID_TIPO_EMPRESA_PUBLICA],
            ['nit' => '654321', 'name' => 'Rápido el Carmen', 'tipo_empresa_id' => self::ID_TIPO_EMPRESA_PUBLICA],
            // ['nit' => '112233', 'name' => 'Solo Dios y la Alcadía sabe como se llama la otra :V'], // TODO
        ];

        // Insertamos tal cual
        DB::table('empresas')->insert($base);

        // 2) Marcar estas 3 como PÚBLICAS (si existe el tipo)
        $publicId = DB::table('tipo_empresa')
            ->where(function ($q) {
                // tolerante a MAYÚSCULAS y acentos: PÚBLICA / PUBLICA
                $q->whereRaw('UPPER(descripcion) LIKE ?', ['PÚBLIC%'])
                  ->orWhereRaw('UPPER(descripcion) LIKE ?', ['PUBLIC%']);
            })
            ->value('id');

        if ($publicId) {
            DB::table('empresas')
                ->whereIn('nit', array_column($base, 'nit'))
                ->update(['tipo_empresa_id' => $publicId]);
        }

        // 3) Datos de prueba aleatorios (tipo_empresa_id random)
        $faker   = \Faker\Factory::create('es_CO');
        $tipoIds = DB::table('tipo_empresa')->pluck('id')->all();

        if (!empty($tipoIds)) {
            $extra = [];
            for ($i = 0; $i < 20; $i++) {
                $extra[] = [
                    'nit'              => $faker->unique()->numerify('#########'),
                    'name'             => $faker->company(),
                    'tipo_empresa_id'  => $tipoIds[array_rand($tipoIds)],
                ];
            }
            DB::table('empresas')->insert($extra);
        }
    }
}
