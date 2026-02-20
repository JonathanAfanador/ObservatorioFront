<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="TipoDoc",
 *   title="TipoDoc",
 *   description="Modelo que representa un tipo de documento.",
 *   type="object",
 *   required={"id", "descripcion"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del tipo de documento",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     description="Descripción del tipo de documento",
 *     example="Factura"
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
class tipo_doc extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoDocFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;
    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_doc';

    protected $fillable = [
        'descripcion',
    ];

    public function documentos(){
        return $this->hasMany(documentos::class, 'tipo_doc_id');
    }
}
