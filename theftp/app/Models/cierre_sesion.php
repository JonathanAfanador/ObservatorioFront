<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="CierreSesion",
 *   title="CierreSesion",
 *   description="Registro de cierre de sesión de un usuario.",
 *   type="object",
 *   required={"id", "usuario_id", "fecha_hora_cierre"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del registro de cierre de sesión",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="direccion_ip",
 *     type="string",
 *     nullable=true,
 *     description="Dirección IP desde la que se realizó el cierre de sesión",
 *     example="192.168.1.1"
 *   ),
 *   @OA\Property(
 *     property="fecha_hora_cierre",
 *     type="string",
 *     format="date-time",
 *     description="Fecha y hora del cierre de sesión",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="usuario_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del usuario que realizó el cierre de sesión",
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
class cierre_sesion extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\CierreSesionFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'cierre_sesion';

    protected $fillable = [
        'usuario_id',
        'fecha_hora_cierre',
        'direccion_ip',
    ];

    public function usuario(){
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
