<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class vehiculo extends Model
{
    /** @use HasFactory<\Database\Factories\VehiculoFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'vehiculos';

    protected $fillable = [
        'placa',
        'marca',
        'modelo',
        'color',
        'tipo_vehiculo_id',
        'categoria_licencia_id',
    ];

    // Función para definir la relación con el modelo tipo_vehiculo
    public function tipoVehiculo(){
        return $this->belongsTo(tipo_vehiculo::class, 'tipo_vehiculo_id'); // Relación con el modelo tipo_vehiculo
    }

    // Función para definir la relación con el modelo categorias_licencia
    public function categoriaLicencia(){
        return $this->belongsTo(categorias_licencia::class, 'categoria_licencia_id'); // Relación con el modelo categorias_licencia
    }
}
