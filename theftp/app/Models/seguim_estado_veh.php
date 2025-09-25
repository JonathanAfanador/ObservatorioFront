<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class seguim_estado_veh extends Model
{
    /** @use HasFactory<\Database\Factories\SeguimEstadoVehFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'seguim_estados_veh';

    protected $fillable = [
        'kilometraje',
        'fecha_hora',
        'observaciones',
        'usuario_id',
        'vehiculo_id',
    ];

    // Función para definir la relación con el modelo usuarios
    public function usuario(){
        return $this->belongsTo(User::class, 'usuario_id'); // Relación con el modelo usuarios
    }

    // Función para definir la relación con el modelo vehiculos
    public function vehiculo(){
        return $this->belongsTo(vehiculo::class, 'vehiculo_id'); // Relación con el modelo vehiculos
    }
}
