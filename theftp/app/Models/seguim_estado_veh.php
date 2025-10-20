<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="SeguimEstadoVeh",
 *   title="SeguimEstadoVeh",
 *   description="Modelo que representa el seguimiento del estado de un vehículo.",
 *   type="object",
 *   required={"id", "usuario_id", "vehiculo_id", "ruta_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del seguimiento del estado del vehículo",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="kilometraje",
 *     type="integer",
 *     nullable=true,
 *     description="Kilometraje del vehículo en el momento del seguimiento",
 *     example=120000
 *   ),
 *   @OA\Property(
 *     property="fecha_hora",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha y hora del seguimiento",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="observaciones",
 *     type="string",
 *     nullable=true,
 *     description="Observaciones sobre el estado del vehículo",
 *     example="Revisión técnica realizada"
 *   ),
 *   @OA\Property(
 *     property="usuario_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del usuario que realizó el seguimiento",
 *     example=42
 *   ),
 *   @OA\Property(
 *     property="vehiculo_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del vehículo asociado al seguimiento",
 *     example=10
 *   ),
 *   @OA\Property(
 *     property="ruta_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la ruta asociada al seguimiento",
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
class seguim_estado_veh extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\SeguimEstadoVehFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'seguim_estado_veh';

    protected $fillable = [
        'kilometraje',
        'fecha_hora',
        'observaciones',
        'usuario_id',
        'vehiculo_id',
        'ruta_id',
    ];

    // Relación con el modelo usuarios
    public function usuario(){
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // Relación con el modelo vehiculos
    public function vehiculo(){
        return $this->belongsTo(vehiculo::class, 'vehiculo_id');
    }

    // Relación con el modelo rutas
    public function ruta(){
        return $this->belongsTo(rutas::class, 'ruta_id');
    }
}
