<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tipo_vehiculo extends Model
{
    /** @use HasFactory<\Database\Factories\TipoVehiculoFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipos_vehiculos';

    protected $fillable = [
        'descripcion',
        'capacidad',
    ];
}
