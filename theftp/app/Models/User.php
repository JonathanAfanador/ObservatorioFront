<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Contracts\Auditable;

/**
 * @OA\Schema(
 *   schema="User",
 *   title="User",
 *   description="Modelo que representa un usuario del sistema.",
 *   type="object",
 *   required={"id", "name", "email", "password", "persona_id", "rol_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del usuario",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="name",
 *     type="string",
 *     description="Nombre del usuario",
 *     example="Juan Pérez"
 *   ),
 *   @OA\Property(
 *     property="email",
 *     type="string",
 *     format="email",
 *     description="Correo electrónico del usuario",
 *     example="juan.perez@example.com"
 *   ),
 *   @OA\Property(
 *     property="password",
 *     type="string",
 *     description="Contraseña del usuario (encriptada)",
 *     example="hashed_password"
 *   ),
 *   @OA\Property(
 *     property="unable",
 *     type="boolean",
 *     description="Indica si el usuario está deshabilitado",
 *     example=false
 *   ),
 *   @OA\Property(
 *     property="unable_date",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha en la que el usuario fue deshabilitado",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="email_verified_at",
 *     type="string",
 *     format="date-time",
 *     nullable=true,
 *     description="Fecha en la que el correo electrónico fue verificado",
 *     example="2025-10-18T12:34:56Z"
 *   ),
 *   @OA\Property(
 *     property="persona_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la persona asociada al usuario",
 *     example=42
 *   ),
 *   @OA\Property(
 *     property="rol_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del rol asociado al usuario",
 *     example=2
 *   ),
 *   @OA\Property(
 *     property="empresa_id",
 *     type="integer",
 *     format="int64",
 *     nullable=true,
 *     description="ID de la empresa asociada al usuario (si aplica)",
 *     example=5
 *   ),
 *   @OA\Property(
 *     property="remember_token",
 *     type="string",
 *     nullable=true,
 *     description="Token para recordar la sesión del usuario",
 *     example="random_token"
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
class User extends Authenticatable implements Auditable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;
    use \OwenIt\Auditing\Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'unable',
        'unable_date',
        'email_verified_at',
        'persona_id',
        'rol_id',
        'empresa_id',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function persona()
    {
        return $this->belongsTo(personas::class, 'persona_id');
    }

    public function rol()
    {
        return $this->belongsTo(rol::class, 'rol_id');
    }

    public function empresa()
    {
        return $this->belongsTo(empresas::class, 'empresa_id');
    }
}
