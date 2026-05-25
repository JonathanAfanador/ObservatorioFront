<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Scopes\TenantScope;
use App\Models\Empresa;

/**
 * @OA\Schema(
 *   schema="RestriccionLicencia",
 *   title="RestriccionLicencia",
 *   description="Modelo que representa una restricción de licencia.",
 *   type="object",
 *   required={"id", "descripcion"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la restricción de licencia",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     maxLength=150,
 *     description="Descripción de la restricción de licencia",
 *     example="Restricción para vehículos pesados"
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
 *   ),
 *   @OA\Property(
 *     property="estado",
 *     type="boolean",
 *     description="Estado de la restricción (habilitada/inhabilitada)",
 *     example=true
 *   )
 * )
 */
class RestriccionLicencia extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RestriccionLicFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'restriccion_lic';

    protected $fillable = [
        'descripcion',
        'estado',
        'empresa_id'
    ];

    public function licencias(){
        return $this->hasMany(Licencia::class, 'restriccion_lic_id');
    }

    public function empresa(){
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
