<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\Model;

class tipo_vehiculo extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoVehiculoFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_vehiculo';

    protected $fillable = [
        'descripcion',
        'capacidad',
    ];
}
