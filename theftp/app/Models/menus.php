<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Menu",
 *   title="Menu",
 *   description="Modelo que representa un menú.",
 *   type="object",
 *   required={"id", "name"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del menú",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre del menú",
 *     example="Inicio"
 *   ),
 *   @OA\Property(
 *     property="icon",
 *     type="string",
 *     nullable=true,
 *     description="Ícono asociado al menú",
 *     example="fa-home"
 *   ),
 *   @OA\Property(
 *     property="url",
 *     type="string",
 *     nullable=true,
 *     description="URL asociada al menú",
 *     example="/inicio"
 *   ),
 *   @OA\Property(
 *     property="padre_id",
 *     type="integer",
 *     format="int64",
 *     nullable=true,
 *     description="ID del menú padre (si aplica)",
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
class menus extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\MenusFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    protected $table = 'menus';

    protected $fillable = [
        'name',
        'icon',
        'url',
        'padre_id',
    ];

    // Relación con el modelo Menus (un menú puede tener muchos submenús)
    public function roles_menu(){
        return $this->hasMany(roles_menu::class, 'menu_id');
    }

    // Relación con el menú padre
    public function parent(){
        return $this->belongsTo(self::class, 'padre_id');
    }

    // Hijos directos
    public function submenus(){
        return $this->hasMany(self::class, 'padre_id');
    }

    // Hijos recursivos: carga toda la jerarquía de submenús
    // TODO: Evitar ciclo infinito en caso de padres circulares
    public function submenusRecursive(){
        return $this->submenus()->with('submenusRecursive', 'roles_menu');
    }

    // Scope auxiliar para cargar la jerarquía en una consulta
    public function scopeWithSubmenusRecursive($query){
        return $query->with('submenusRecursive', 'roles_menu');
    }
}
