<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Propietario",
 *   title="Propietario",
 *   description="Modelo que representa un propietario.",
 *   type="object",
 *   required={"id", "fecha_registro", "documento_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del propietario",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="fecha_registro",
 *     type="string",
 *     format="date-time",
 *     description="Fecha de registro del propietario",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="documento_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del documento asociado al propietario",
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
class propietarios extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\PropietariosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'propietarios';

    protected $fillable = [
        'fecha_registro',
        'documento_id',
    ];

    // Relación con el modelo documentos
    public function documento(){
        return $this->belongsTo(documentos::class, 'documento_id');
    }
}
