<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Ruta",
 *   title="Ruta",
 *   description="Modelo que representa una ruta.",
 *   type="object",
 *   required={"id", "name", "file_name", "empresa_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la ruta",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre de la ruta",
 *     example="Ruta 101"
 *   ),
 *   @OA\Property(
 *     property="file_name",
 *     type="string",
 *     description="Nombre del archivo asociado a la ruta",
 *     example="ruta_101.pdf"
 *   ),
 *   @OA\Property(
 *     property="empresa_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la empresa asociada a la ruta",
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
class rutas extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RutasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'rutas';

    protected $fillable = [
        'name',
        'file_name',
        'empresa_id',
        'municipios_id',
    ];

    // Relación con el modelo empresas
    public function empresa(){
        return $this->belongsTo(empresas::class, 'empresa_id');
    }
}
