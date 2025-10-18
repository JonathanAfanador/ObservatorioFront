<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="SeguimGps",
 *   title="SeguimGps",
 *   description="Modelo que representa el seguimiento GPS de un vehículo.",
 *   type="object",
 *   required={"id", "vehiculo_id", "latitud", "longitud", "fecha_hora"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del seguimiento GPS",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="latitud",
 *     type="number",
 *     format="float",
 *     nullable=true,
 *     description="Latitud de la ubicación del vehículo",
 *     example=6.2442
 *   ),
 *   @OA\Property(
 *     property="longitud",
 *     type="number",
 *     format="float",
 *     nullable=true,
 *     description="Longitud de la ubicación del vehículo",
 *     example=-75.5812
 *   ),
 *   @OA\Property(
 *     property="fecha_hora",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha y hora del seguimiento GPS",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="vehiculo_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del vehículo asociado al seguimiento GPS",
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
class seguim_gps extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\SeguimGpsFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'seguim_gps';

    protected $fillable = [
        'fecha_hora',
        'vehiculo_id',
        'latitud',
        'longitud',
    ];

    // Relación con el modelo vehiculos
    public function vehiculo(){
        return $this->belongsTo(vehiculo::class, 'vehiculo_id');
    }
}
