<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;
/**
 * @OA\Schema(
 *   schema="Municipio",
 *   title="Municipio",
 *   description="Modelo que representa un municipio.",
 *   type="object",
 *   required={"id", "name", "codigo_dane", "departamentos_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del municipio",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre del municipio",
 *     example="Medellín"
 *   ),
 *   @OA\Property(
 *     property="codigo_dane",
 *     type="string",
 *     description="Código DANE del municipio",
 *     example="05001"
 *   ),
 *   @OA\Property(
 *     property="departamentos_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del departamento asociado al municipio",
 *     example=5
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
class municipios extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\MunicipiosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'municipios';

    protected $fillable = [
        'name',
        'codigo_dane',
        'departamentos_id',
    ];

    public function departamento(){
        return $this->belongsTo(departamentos::class, 'departamentos_id');
    }
}
