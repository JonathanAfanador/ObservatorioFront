<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class seguim_gps extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\SeguimGpsFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'seguim_gps';

    protected $fillable = [
        'fecha_hora',
        'vehiculo_id',
        'latitud',
        'longitud',
    ];

    // Función para definir la relación con el modelo vehiculos
    public function vehiculo(){
        return $this->belongsTo(vehiculo::class, 'vehiculo_id'); // Relación con el modelo vehiculos
    }
}
