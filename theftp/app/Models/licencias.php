<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="Licencia",
 *   title="Licencia",
 *   description="Modelo que representa una licencia de conducción.",
 *   type="object",
 *   required={"id", "restriccion_lic_id", "categoria_lic_id", "documento_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la licencia",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="restriccion_lic_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la restricción asociada a la licencia",
 *     example=2
 *   ),
 *   @OA\Property(
 *     property="categoria_lic_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la categoría asociada a la licencia",
 *     example=3
 *   ),
 *   @OA\Property(
 *     property="documento_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del documento asociado a la licencia",
 *     example=4
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
class licencias extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\LicenciasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'licencias';

    protected $fillable = [
        'restriccion_lic_id',
        'categoria_lic_id',
        'documento_id',
    ];

    // Función para definir la relación con el modelo restricciones_licencias
    public function restriccion(){
        return $this->belongsTo(restriccion_lic::class, 'restriccion_lic_id'); // Relación con el modelo restricciones_licencias
    }

    // Función para definir la relación con el modelo categorias_licencias
    public function categoria(){
        return $this->belongsTo(categorias_licencia::class, 'categoria_lic_id'); // Relación con el modelo categorias_licencias
    }

    // Función para definir la relación con el modelo documentos
    public function documento(){
        return $this->belongsTo(documentos::class, 'documento_id'); // Relación con el modelo documentos
    }
}
