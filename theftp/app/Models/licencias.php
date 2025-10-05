<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class licencias extends Model
{
    /** @use HasFactory<\Database\Factories\LicenciasFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'licencias';

    protected $fillable = [
        'restriccion_lic_id',
        'categoria_lic_id',
        'documento_id',
    ];

    // Función para definir la relación con el modelo restricciones_licencias
    public function restriccionLic(){
        return $this->belongsTo(restriccion_lic::class, 'restriccion_lic_id'); // Relación con el modelo restricciones_licencias
    }

    // Función para definir la relación con el modelo categorias_licencias
    public function categoriaLic(){
        return $this->belongsTo(categorias_licencia::class, 'categoria_lic_id'); // Relación con el modelo categorias_licencias
    }

    // Función para definir la relación con el modelo documentos
    public function documento(){
        return $this->belongsTo(documentos::class, 'documento_id'); // Relación con el modelo documentos
    }
}
