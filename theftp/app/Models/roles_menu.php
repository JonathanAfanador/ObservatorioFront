<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="RolesMenu",
 *   title="RolesMenu",
 *   description="Modelo que representa la relación entre roles y menús.",
 *   type="object",
 *   required={"id", "rol_id", "menu_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la relación rol-menú",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="rol_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del rol asociado",
 *     example=2
 *   ),
 *   @OA\Property(
 *     property="menu_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del menú asociado",
 *     example=3
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
class roles_menu extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RolesMenuFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'roles_menus';

    protected $fillable = [
        'rol_id',
        'menu_id',
    ];

    // Relación con el modelo Rol
    public function rol(){
        return $this->belongsTo(rol::class, 'rol_id');
    }

    // Relación con el modelo Menus
    public function menu(){
        return $this->belongsTo(menus::class, 'menu_id');
    }
}
