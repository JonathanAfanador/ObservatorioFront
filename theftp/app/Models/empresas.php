<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Empresa",
 *   title="Empresa",
 *   description="Modelo que representa una empresa.",
 *   type="object",
 *   required={"id", "nit", "name", "tipo_empresa_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la empresa",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="nit",
 *     type="string",
 *     description="Número de Identificación Tributaria (NIT) de la empresa",
 *     example="900123456-7"
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre de la empresa",
 *     example="Empresa Ejemplo S.A.S."
 *   ),
 *   @OA\Property(
 *     property="tipo_empresa_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del tipo de empresa asociado",
 *     example=2
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
class empresas extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\EmpresasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    protected $table = 'empresas';

    protected $fillable = [
        'nit',
        'name',
        'razon_social',
        'tipo_empresa_id',
        'representante_legal',
        'email',
        'telefono',
    ];

    public function usuarios(){
        return $this->hasMany(User::class, 'empresa_id');
    }

    public function tipo_empresa(){
        return $this->belongsTo(tipo_empresa::class, 'tipo_empresa_id'); // Relación con el modelo tipo_empresa
    }
}
