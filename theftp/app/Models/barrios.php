<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Barrio",
 *   title="Barrio",
 *   description="Modelo que representa un barrio.",
 *   type="object",
 *   required={"id","name","municipios_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del barrio",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre del barrio",
 *     example="Barrio Centro"
 *   ),
 *   @OA\Property(
 *     property="municipios_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del municipio al que pertenece",
 *     example=10
 *   ),
 *   @OA\Property(
 *     property="created_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de creación",
 *     example="2025-01-01T12:00:00Z"
 *   ),
 *   @OA\Property(
 *     property="updated_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de última actualización",
 *     example="2025-01-02T12:00:00Z"
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
class barrios extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\BarriosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'barrios';

    protected $fillable = [
        'name',
        'municipios'
    ];

    public function municipio(){
        return $this->belongsTo(municipios::class, 'municipios_id');
    }
}
