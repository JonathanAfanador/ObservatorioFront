<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Documento",
 *   title="Documento",
 *   description="Modelo que representa un documento.",
 *   type="object",
 *   required={"id", "url", "observaciones", "tipo_doc_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del documento",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="url",
 *     type="string",
 *     description="URL del documento",
 *     example="https://example.com/documento.pdf"
 *   ),
 *   @OA\Property(
 *     property="observaciones",
 *     type="string",
 *     description="Observaciones sobre el documento",
 *     example="Documento escaneado"
 *   ),
 *   @OA\Property(
 *     property="tipo_doc_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del tipo de documento asociado",
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
class documentos extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\DocumentosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'documentos';

    protected $fillable = [
        'url',
        'observaciones',
        'tipo_doc_id',
    ];

    // Función para definir la relación con el modelo tipos_documentos
    public function tipo_documento(){
        return $this->belongsTo(tipo_doc::class, 'tipo_doc_id'); // Relación con el modelo tipos_documentos
    }
}
