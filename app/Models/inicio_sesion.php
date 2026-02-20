<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="InicioSesion",
 *   title="InicioSesion",
 *   description="Registro de inicio de sesión de un usuario.",
 *   type="object",
 *   required={"id", "usuario_id", "fecha_hora_inicio"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del registro de inicio de sesión",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="direccion_ip",
 *     type="string",
 *     nullable=true,
 *     description="Dirección IP desde la que se realizó el inicio de sesión",
 *     example="192.168.1.1"
 *   ),
 *   @OA\Property(
 *     property="fecha_hora_inicio",
 *     type="string",
 *     format="date-time",
 *     description="Fecha y hora del inicio de sesión",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="fecha_ultima_actividad",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha y hora de la última actividad del usuario",
 *     example="2025-10-18T13:00:00Z"
 *   ),
 *   @OA\Property(
 *     property="usuario_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del usuario que realizó el inicio de sesión",
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
class inicio_sesion extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\InicioSesionFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'inicio_sesion';

    protected $fillable = [
        'usuario_id',
        'fecha_hora_inicio',
        'fecha_ultima_actividad',
        'direccion_ip',
    ];

    public function usuario(){
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
