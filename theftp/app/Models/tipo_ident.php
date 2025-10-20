<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="TipoIdent",
 *   title="TipoIdent",
 *   description="Modelo que representa un tipo de identificación.",
 *   type="object",
 *   required={"id","descripcion"},
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del tipo de identificación",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     description="Descripción del tipo de identificación",
 *     example="Cédula de ciudadanía"
 *   ),
 *   @OA\Property(
 *     property="created_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de creación del registro",
 *     example="2024-01-01T12:00:00Z"
 *   ),
 *   @OA\Property(
 *     property="updated_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de última actualización del registro",
 *     example="2024-01-02T12:00:00Z"
 *   ),
 *   @OA\Property(
 *     property="deleted_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de eliminación (soft delete)",
 *     example=null
 *   ),
 * )
 */
class tipo_ident extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoIdentFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;
    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_ident';

    protected $fillable = [
        'descripcion',
    ];

    public function personas(){
        return $this->hasMany(personas::class, 'tipo_ident_id');
    }
}
