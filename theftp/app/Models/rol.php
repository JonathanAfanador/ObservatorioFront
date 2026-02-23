<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Rol",
 *   title="Rol",
 *   description="Modelo que representa un rol de usuario.",
 *   type="object",
 *   required={"id", "descripcion"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del rol",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     description="Descripción del rol",
 *     example="Administrador"
 *   ),
 *   @OA\Property(
 *     property="created_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de creación del registro",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="updated_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de última actualización del registro",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="deleted_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de eliminación (soft delete)",
 *     example=null
 *   )
 * )
 */
class rol extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RolFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;
    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'rol';

    /**
    * Los atributos que son asignables masivamente.
    */
    protected $fillable = [
        'descripcion',
    ];

    // Relación con el modelo User (un rol puede tener muchos usuarios)
    public function users(){
        return $this->hasMany(User::class, 'rol_id');
    }

    // Relación con el modelo Permisos (un rol puede tener muchos permisos)
    public function permisos(){
        return $this->hasMany(permisos::class, 'rol_id');
    }
}
