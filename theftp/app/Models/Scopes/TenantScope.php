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

            // 2. Si es Admin (Rol 1) o SubAdmin (Rol 6), lo dejamos ver TODO (no aplicamos filtro)
            if (in_array($user->rol_id, [1, 6])) {
                return;
            }

            // 3. Si es Empresa o cualquier otro, filtramos estrictamente por su 'empresa_id'
            // Omitimos la operación si el usuario increíblemente no tiene una empresa asignada.
            if ($user->empresa_id) {
                // EXCEPCIÓN: La tabla Rutas usa una relación Muchos a Muchos (Pivote)
                if ($model instanceof \App\Models\Ruta) {
                    $builder->whereHas('empresas', function ($q) use ($user) {
                        $q->where('empresas.id', $user->empresa_id);
                    });
                } else {
                    // Resto de los modelos fluyen normal
                    $builder->where($model->getTable() . '.empresa_id', $user->empresa_id);
                }
            } else {
                // Si el usuario no es Admin y NO tiene empresa_id, bloqueamos radicalmente
                // forzando un ID que retorne vacío para no exponer data de otros.
                $builder->where($model->getTable() . '.empresa_id', -1);
            }
        }
    }
}
