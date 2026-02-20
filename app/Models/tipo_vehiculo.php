<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="TipoVehiculo",
 *   title="TipoVehiculo",
 *   description="Modelo que representa un tipo de vehículo.",
 *   type="object",
 *   required={"id", "descripcion"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del tipo de vehículo",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     description="Descripción del tipo de vehículo",
 *     example="Camión"
 *   ),
 *   @OA\Property(
 *     property="capacidad",
 *     type="integer",
 *     nullable=true,
 *     description="Capacidad del vehículo (en toneladas o pasajeros, según el caso)",
 *     example=10
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
class tipo_vehiculo extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoVehiculoFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_vehiculo';

    protected $fillable = [
        'descripcion',
        'capacidad',
    ];

    // Relación con el modelo vehiculos (un tipo de vehículo puede tener muchos vehículos)
    public function vehiculos(){
        return $this->hasMany(vehiculo::class, 'tipo_vehiculo_id');
    }
}
