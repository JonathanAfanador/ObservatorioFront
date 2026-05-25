<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // 1. Verificamos que haya alguien logueado (Sanctum SPA)
        if (Auth::check()) {
            $user = Auth::user();

            // 2. Si es Admin (1), Secretaría (2), UPC (4), o SubAdmin (6), lo dejamos ver TODO
            // Estos roles son administrativos o de auditoría global en el contexto de este proyecto.
            if (in_array($user->rol_id, [1, 2, 4, 6])) {
                return;
            }

            // 3. Si es Empresa o cualquier otro, filtramos estrictamente por su 'empresa_id'
            if ($user->empresa_id) {
                // EXCEPCIÓN: La tabla Rutas usa una relación Muchos a Muchos (Pivote)
                if ($model instanceof \App\Models\Ruta) {
                    $builder->whereHas('empresas', function ($q) use ($user) {
                        $q->where('empresas.id', $user->empresa_id);
                    });
                } else {
                    // Resto de los modelos fluyen normal: pueden ver los suyos o los generales (empresa_id null)
                    $tableName = $model->getTable();
                    $builder->where(function ($q) use ($tableName, $user) {
                        $q->where($tableName . '.empresa_id', $user->empresa_id)
                          ->orWhereNull($tableName . '.empresa_id');
                    });
                }
            } else {
                // Si el usuario no es Admin/UPC y NO tiene empresa_id, bloqueamos radicalmente
                // PERO verificamos que la columna exista para evitar el error SQL 500 (columna inexistente)
                $tableName = $model->getTable();
                if (\Illuminate\Support\Facades\Schema::hasColumn($tableName, 'empresa_id')) {
                    $builder->where($tableName . '.empresa_id', -1);
                }
            }
        }
    }
}
