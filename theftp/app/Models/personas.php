<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="Persona",
 *   title="Persona",
 *   description="Modelo que representa una persona.",
 *   type="object",
 *   required={"id", "nui", "name", "last_name", "phone_number", "gender", "tipo_ident_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la persona",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="nui",
 *     type="string",
 *     description="Número único de identificación (NUI) de la persona",
 *     example="123456789"
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre de la persona",
 *     example="Juan"
 *   ),
 *   @OA\Property(
 *     property="last_name",
 *     type="string",
 *     description="Apellido de la persona",
 *     example="Pérez"
 *   ),
 *   @OA\Property(
 *     property="phone_number",
 *     type="string",
 *     description="Número de teléfono de la persona",
 *     example="3001234567"
 *   ),
 *   @OA\Property(
 *     property="gender",
 *     type="string",
 *     enum={"Mujer", "Hombre"},
 *     description="Género de la persona",
 *     example="Hombre"
 *   ),
 *   @OA\Property(
 *     property="tipo_ident_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del tipo de identificación asociado a la persona",
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
class personas extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\PersonasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'personas';

    protected $fillable = [
        'nui',
        'name',
        'last_name',
        'phone_number',
        'gender',
        'tipo_ident_id',
    ];

    // Posibles valores de género
    public const GENDER_MUJER = 'Mujer';
    public const GENDER_HOMBRE = 'Hombre';

    // Relación con el modelo TipoIdent
    public function tipo_ident()
    {
        return $this->belongsTo(tipo_ident::class, 'tipo_ident_id');
    }
}
