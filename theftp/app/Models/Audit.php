<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Audit",
 *   title="Audit",
 *   description="Registro de auditoría.",
 *   type="object",
 *   required={"id","event","auditable_type","auditable_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del registro",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="user_type",
 *     type="string",
 *     nullable=true,
 *     description="Tipo de usuario asociado (modelo)",
 *     example="App\\Models\\User"
 *   ),
 *   @OA\Property(
 *     property="user_id",
 *     type="integer",
 *     format="int64",
 *     nullable=true,
 *     description="ID del usuario que realizó la acción",
 *     example=42
 *   ),
 *   @OA\Property(
 *     property="event",
 *     type="string",
 *     description="Nombre del evento (create, update, delete, ...)",
 *     example="updated"
 *   ),
 *   @OA\Property(
 *     property="auditable_type",
 *     type="string",
 *     description="Tipo del modelo auditado",
 *     example="App\\Models\\Audit"
 *   ),
 *   @OA\Property(
 *     property="auditable_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del registro auditado",
 *     example=10
 *   ),
 *   @OA\Property(
 *     property="old_values",
 *     type="string",
 *     nullable=true,
 *     description="Valores anteriores (JSON/text)"
 *   ),
 *   @OA\Property(
 *     property="new_values",
 *     type="string",
 *     nullable=true,
 *     description="Nuevos valores (JSON/text)"
 *   ),
 *   @OA\Property(
 *     property="url",
 *     type="string",
 *     nullable=true,
 *     description="URL donde se realizó la acción",
 *     example="https://api.example.com/resource/10"
 *   ),
 *   @OA\Property(
 *     property="ip_address",
 *     type="string",
 *     nullable=true,
 *     description="Dirección IP desde la que se realizó la acción",
 *     example="203.0.113.5"
 *   ),
 *   @OA\Property(
 *     property="user_agent",
 *     type="string",
 *     nullable=true,
 *     description="User agent",
 *     example="Mozilla/5.0 (X11; Linux x86_64)"
 *   ),
 *   @OA\Property(
 *     property="tags",
 *     type="string",
 *     nullable=true,
 *     description="Etiquetas asociadas",
 *     example="sistema,importante"
 *   ),
 *   @OA\Property(
 *     property="created_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de creación",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="updated_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha de última actualización",
 *     example="2025-10-18T12:34:56Z"
 *   )
 * )
 */
class Audit extends Model{
    use HasFactory;
    use SoftDeletes;


    protected $table = "audits";

    // attributes
    protected $fillable = [
        'user_type',
        'user_id',
        'event',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'url',
        'ip_address',
        'user_agent',
        'tags',
    ];

}
