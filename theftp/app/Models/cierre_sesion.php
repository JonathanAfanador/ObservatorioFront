<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class cierre_sesion extends Model
{
    /** @use HasFactory<\Database\Factories\CierreSesionFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'cierre_sesion';

    protected $fillable = [
        'usuario_id',
        'fecha_hora_cierre',
        'direccion_ip',
    ];
}
