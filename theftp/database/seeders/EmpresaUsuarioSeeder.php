<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmpresaUsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Empresas base por NIT
        $baseNits = ['123456', '654321', '112233'];
        $baseEmpresaIds = DB::table('empresas')
            ->whereIn('nit', $baseNits)
            ->pluck('id')
            ->all();

        if (count($baseEmpresaIds) !== count($baseNits)) {
            throw new \RuntimeException("No se encontraron todas las empresas base por NIT. Verifica que EmpresaSeeder corrió antes.");
        }

        // 2) Usuarios con rol 'Secretaria_de_transito' (IDs enteros desde DB)
        $secretariaUserIds = DB::table('users')
            ->join('rol', 'rol.id', '=', 'users.rol_id')
            ->where('rol.descripcion', 'Secretaria_de_transito')
            ->pluck('users.id')
            ->all();

        if (empty($secretariaUserIds)) {
            throw new \RuntimeException("No hay usuarios con rol 'Secretaria_de_transito'. Corre Roles/Users seeder primero.");
        }

        // 3) Otras empresas (todas menos las base)
        $otrasEmpresaIds = DB::table('empresas')
            ->whereNotIn('id', $baseEmpresaIds)
            ->pluck('id')
            ->all();

        // 4) Pool de usuarios para asignación aleatoria de "otras" empresas
        //    Preferimos usuarios con rol 'Empresa_transporte'; si no hay, usamos todos.
        $empresaTransUserIds = DB::table('users')
            ->join('rol', 'rol.id', '=', 'users.rol_id')
            ->where('rol.descripcion', 'Empresa_transporte')
            ->pluck('users.id')
            ->all();

        $poolRandom = !empty($empresaTransUserIds)
            ? $empresaTransUserIds
            : DB::table('users')->pluck('id')->all();

        if (empty($poolRandom)) {
            throw new \RuntimeException("No hay usuarios para asignación aleatoria en empresa_usuario.");
        }

        // 5) Construir filas
        $rows = [];

        // 5a) Asignar empresas base a Secretaría (round-robin si hay varios)
        $countSec = count($secretariaUserIds);
        foreach (array_values($baseEmpresaIds) as $i => $empresaId) {
            $usuarioId = $secretariaUserIds[$i % $countSec];
            $rows[] = [
                'empresa_id' => (int) $empresaId,
                'usuario_id' => (int) $usuarioId,
                // timestamps: la migración los deja null por defecto, así que podemos omitirlos
            ];
        }

        // 5b) Asignar otras empresas aleatoriamente
        foreach ($otrasEmpresaIds as $empresaId) {
            $usuarioId = $poolRandom[array_rand($poolRandom)];
            $rows[] = [
                'empresa_id' => (int) $empresaId,
                'usuario_id' => (int) $usuarioId,
            ];
        }

        // 6) Insertar
        // Nota: si ejecutarás este seeder varias veces, considera limpiar antes:
        // DB::table('empresa_usuario')->truncate();  // solo si es seguro hacerlo
        DB::table('empresa_usuario')->insert($rows);
    }
}
