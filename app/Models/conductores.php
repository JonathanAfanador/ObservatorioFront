<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Conductor",
 *   title="Conductor",
 *   description="Modelo que representa un conductor.",
 *   type="object",
 *   required={"id", "persona_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del conductor",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="persona_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la persona asociada al conductor",
 *     example=42
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
class conductores extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\ConductoresFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'conductores';

    protected $fillable = [
        'persona_id',
    ];

    // Función para definir la relación con el modelo personas
    public function persona(){
        return $this->belongsTo(personas::class, 'persona_id'); // Relación con el modelo personas
    }
}
