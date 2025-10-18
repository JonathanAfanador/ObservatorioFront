<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="Vehiculo",
 *   title="Vehiculo",
 *   description="Modelo que representa un vehículo.",
 *   type="object",
 *   required={"id", "placa", "marca", "modelo", "color", "propietario_id", "tipo_veh_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del vehículo",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="placa",
 *     type="string",
 *     description="Placa del vehículo",
 *     example="ABC123"
 *   ),
 *   @OA\Property(
 *     property="marca",
 *     type="string",
 *     description="Marca del vehículo",
 *     example="Toyota"
 *   ),
 *   @OA\Property(
 *     property="modelo",
 *     type="string",
 *     description="Modelo del vehículo",
 *     example="Corolla"
 *   ),
 *   @OA\Property(
 *     property="color",
 *     type="string",
 *     description="Color del vehículo",
 *     example="Rojo"
 *   ),
 *   @OA\Property(
 *     property="servicio",
 *     type="boolean",
 *     description="Indica si el vehículo está en servicio",
 *     example=false
 *   ),
 *   @OA\Property(
 *     property="propietario_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del propietario del vehículo",
 *     example=42
 *   ),
 *   @OA\Property(
 *     property="tipo_veh_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del tipo de vehículo asociado",
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
class vehiculo extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\VehiculoFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'vehiculo';

    protected $fillable = [
        'placa',
        'marca',
        'modelo',
        'color',
        'servicio',
        'propietario_id',
        'tipo_veh_id',
    ];

    // Relación con el modelo tipo_vehiculo
    public function tipo(){
        return $this->belongsTo(tipo_vehiculo::class, 'tipo_veh_id');
    }

    // Relación con el modelo propietarios
    public function propietario(){
        return $this->belongsTo(propietarios::class, 'propietario_id');
    }
}
