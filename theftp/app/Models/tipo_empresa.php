<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="TipoEmpresa",
 *   title="TipoEmpresa",
 *   description="Modelo que representa un tipo de empresa.",
 *   type="object",
 *   required={"id", "descripcion"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del tipo de empresa",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     description="Descripción del tipo de empresa",
 *     example="Transporte"
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
class tipo_empresa extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoEmpresaFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_empresa';

    protected $fillable = [
        'descripcion',
    ];

    // Relación con el modelo empresas (un tipo de empresa puede tener muchas empresas)
    public function empresas(){
        return $this->hasMany(empresas::class, 'tipo_empresa_id');
    }
}
