<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Permiso",
 *   title="Permiso",
 *   description="Modelo que representa los permisos asignados a un rol.",
 *   type="object",
 *   required={"id", "tabla", "create", "read", "update", "delete", "rol_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del permiso",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="tabla",
 *     type="string",
 *     description="Nombre de la tabla a la que aplican los permisos",
 *     example="users"
 *   ),
 *   @OA\Property(
 *     property="create",
 *     type="boolean",
 *     description="Indica si el rol tiene permiso para crear registros",
 *     example=true
 *   ),
 *   @OA\Property(
 *     property="read",
 *     type="boolean",
 *     description="Indica si el rol tiene permiso para leer registros",
 *     example=true
 *   ),
 *   @OA\Property(
 *     property="update",
 *     type="boolean",
 *     description="Indica si el rol tiene permiso para actualizar registros",
 *     example=false
 *   ),
 *   @OA\Property(
 *     property="delete",
 *     type="boolean",
 *     description="Indica si el rol tiene permiso para eliminar registros",
 *     example=false
 *   ),
 *   @OA\Property(
 *     property="rol_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del rol asociado a los permisos",
 *     example=2
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
class permisos extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\PermisosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'permisos';

    protected $fillable = [
        'tabla',
        'create',
        'read',
        'update',
        'delete',
        'rol_id',
    ];

    public function rol(){
        return $this->belongsTo(rol::class, 'rol_id');
    }
}
