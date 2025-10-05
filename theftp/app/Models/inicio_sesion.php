<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class inicio_sesion extends Model
{
    /** @use HasFactory<\Database\Factories\InicioSesionFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'inicio_sesions';

    protected $fillable = [
        'usuario_id',
        'fecha_hora_inicio',
        'fecha_ultima_actividad',
        'ip'
    ];
}
