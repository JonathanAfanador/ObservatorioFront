<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @OA\Schema(
 *   schema="Licencia",
 *   title="Licencia",
 *   description="Modelo que representa una licencia de conducción.",
 *   type="object",
 *   required={"id", "restriccion_lic_id", "categoria_lic_id", "documento_id"},
 *
 *   @OA\Property(
 *     property="id",
 *     type="integer",
 *     format="int64",
 *     description="Identificador único de la licencia",
 *     readOnly=true,
 *     example=1
 *   ),
  *   @OA\Property(
 *     property="numero",
 *     type="string",
 *     description="Número de la licencia",
 *     example="12345678"
 *   ),
 *   @OA\Property(
 *     property="restriccion_lic_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la restricción asociada a la licencia",
 *     example=2
 *   ),
 *   @OA\Property(
 *     property="categoria_lic_id",
 *     type="integer",
 *     format="int64",
 *     description="ID de la categoría asociada a la licencia",
 *     example=3
 *   ),
 *   @OA\Property(
 *     property="documento_id",
 *     type="integer",
 *     format="int64",
 *     description="ID del documento asociado a la licencia",
 *     example=4
 *   ),
 *   @OA\Property(
 *     property="fecha_expedicion",
 *     type="string",
 *     format="date",
 *     nullable=true,
 *     description="Fecha de expedición",
 *     example="2020-01-01"
 *   ),
 *   @OA\Property(
 *     property="fecha_vencimiento",
 *     type="string",
 *     format="date",
 *     nullable=true,
 *     description="Fecha de vencimiento",
 *     example="2030-01-01"
 *   ),
 *   @OA\Property(
 *     property="organismo_transito",
 *     type="string",
 *     nullable=true,
 *     description="Organismo de tránsito que expidió la licencia",
 *     example="ST de Bogotá"
 *   ),
 *   @OA\Property(
 *     property="estado",
 *     type="string",
 *     description="Estado de la licencia (vigente, vencida, por_vencer)",
 *     example="vigente"
 *   ),
 *   @OA\Property(
 *     property="verificado_secretaria",
 *     type="boolean",
 *     description="Si la licencia ha sido verificada por la secretaría",
 *     example=false
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
class Licencia extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\LicenciasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'licencias';

    protected $fillable = [
        'numero',
        'restriccion_lic_id',
        'categoria_lic_id',
        'documento_id',
        'fecha_expedicion',
        'fecha_vencimiento',
        'organismo_transito',
        'estado',
        'motivo_estado',
        'verificado_secretaria',
    ];

    protected static function booted(): void
    {
        // Lógica de cascada de Inactividad
        static::updated(function ($licencia) {
            if ($licencia->wasChanged('estado') && $licencia->estado == false) {
                // Inactivar conductor asociado automáticamente
                $relaciones = \App\Models\ConductorLicencia::where('licencia_id', $licencia->id)->with('conductor')->get();
                foreach ($relaciones as $rel) {
                    if ($rel->conductor && $rel->conductor->estado) {
                        $rel->conductor->update([
                            'estado' => false,
                            'motivo_estado' => 'Licencia Suspendida/Cancelada (Art. 26)'
                        ]);
                    }
                }
            }
        });
    }

    // Función para definir la relación con el modelo restricciones_licencias
    public function restriccion(){
        return $this->belongsTo(RestriccionLicencia::class, 'restriccion_lic_id'); 
    }

    // Función para definir la relación con el modelo categorias_licencias
    public function categoria(){
        return $this->belongsTo(CategoriaLicencia::class, 'categoria_lic_id'); // Relación con el modelo categorias_licencias
    }

    // Historial de Novedades de la Licencia
    public function novedades()
    {
        return $this->hasMany(NovedadLicencia::class, 'licencia_id');
    }

    // Función para definir la relación con el modelo conductores a través de la tabla pivote
    public function conductores()
    {
        return $this->belongsToMany(Conductor::class, 'conductores_licencias', 'licencia_id', 'conductor_id')
                    ->withTimestamps()
                    ->whereNull('conductores_licencias.deleted_at');
    }

    // Función para definir la relación con el modelo documentos
    public function documento(){
        return $this->belongsTo(Documento::class, 'documento_id'); // Relación con el modelo documentos
    }
}
