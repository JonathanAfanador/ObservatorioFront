<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="ConductorLicencia",
 *   title="ConductorLicencia",
 *   description="Relación entre conductores y licencias.",
 *   type="object",
 *   required={"id", "licencia_id", "conductor_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la relación conductor-licencia",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="licencia_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la licencia asociada",
 *     example=10
 *   ),
 *   @OA\Property(
 *     property="conductor_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del conductor asociado",
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
class conductores_licencias extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\CoductoresLicenciasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'conductores_licencias';

    protected $fillable = [
        'conductor_id',
        'licencia_id',
    ];

    // Función para definir la relación con el modelo conductores
    public function conductor(){
        return $this->belongsTo(conductores::class, 'conductor_id'); // Relación con el modelo conductores
    }

    // Función para definir la relación con el modelo licencias
    public function licencia(){
        return $this->belongsTo(licencias::class, 'licencia_id'); // Relación con el modelo licencias
    }
}
