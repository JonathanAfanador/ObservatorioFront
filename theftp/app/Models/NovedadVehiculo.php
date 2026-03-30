<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NovedadVehiculo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'novedad_vehiculos';

    protected $fillable = [
        'vehiculo_id',
        'tipo_novedad',
        'fecha_inicio',
        'fecha_fin',
        'observaciones'
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }
}
