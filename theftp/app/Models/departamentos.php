<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="Departamento",
 *   title="Departamento",
 *   description="Modelo que representa un departamento.",
 *   type="object",
 *   required={"id", "name", "codigo_dane"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del departamento",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre del departamento",
 *     example="Antioquia"
 *   ),
 *   @OA\Property(
 *     property="codigo_dane",
 *     type="string",
 *     description="Código DANE del departamento",
 *     example="05"
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
class departamentos extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\DepartamentosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'departamentos';

    protected $fillable = [
        'name',
        'codigo_dane',
    ];

    public function municipios(){
        return $this->hasMany(municipios::class, 'departamentos_id');
    }
}
