<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Scopes\TenantScope;

/**
 * @OA\Schema(
 *   schema="Conductor",
 *   title="Conductor",
 *   description="Modelo que representa un conductor.",
 *   type="object",
 *   required={"id", "persona_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único del conductor",
 *     readOnly=true,
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="persona_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la persona asociada al conductor",
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
class Conductor extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\ConductoresFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
     * El "booted" method of the model.
     * Aquí inyectamos el TenantScope (Guardián de Propiedad)
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);

        // Lógica de cascada de Inactividad
        static::updated(function ($conductor) {
            if ($conductor->wasChanged('estado') && $conductor->estado == false) {
                // Inactivar licencia asociada si es "Despido" o "Retiro"
                if (in_array($conductor->motivo_estado, ['Despido / Retiro de la Empresa', 'Despido / Retiro Definitivo', 'Despido'])) {
                    $relaciones = \App\Models\ConductorLicencia::where('conductor_id', $conductor->id)->with('licencia')->get();
                    foreach ($relaciones as $rel) {
                        if ($rel->licencia && $rel->licencia->estado) {
                            $rel->licencia->update([
                                'estado' => false,
                                'motivo_estado' => 'Retiro definitivo del conductor'
                            ]);
                        }
                    }
                }
            }
        });
    }

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'conductores';

    protected $fillable = [
        'persona_id',
        'empresa_id',
        'estado',
        'motivo_estado',
    ];

    // Función para definir la relación con el modelo personas
    public function persona(){
        return $this->belongsTo(Persona::class, 'persona_id'); // Relación con el modelo personas
    }

    // Historial de Novedades del Conductor
    public function novedades()
    {
        return $this->hasMany(NovedadConductor::class, 'conductor_id')->orderBy('fecha_inicio', 'desc');
    }
}
