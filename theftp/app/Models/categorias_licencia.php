<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="CategoriaLicencia",
 *   title="CategoriaLicencia",
 *   description="Categoría de licencia de conducción.",
 *   type="object",
 *   required={"id","codigo","descripcion"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la categoría",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="codigo",
 *     type="string",
 *     maxLength=150,
 *     description="Código de la categoría",
 *     example="A"
 *   ),
 *   @OA\Property(
 *     property="descripcion",
 *     type="string",
 *     description="Descripción de la categoría",
 *     example="Categoría A - vehículos livianos"
 *   ),
 *   @OA\Property(
 *     property="created_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de creación"
 *   ),
 *   @OA\Property(
 *     property="updated_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de última actualización"
 *   ),
 *   @OA\Property(
 *     property="deleted_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de eliminación (soft delete)"
 *   )
 * )
 */
class categorias_licencia extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\CategoriasLicenciaFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'categorias_licencia';

    protected $fillable = [
        'codigo',
        'descripcion',
    ];
}
