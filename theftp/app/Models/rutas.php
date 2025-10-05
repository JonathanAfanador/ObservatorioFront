<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class rutas extends Model
{
    /** @use HasFactory<\Database\Factories\RutasFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'rutas';

    protected $fillable = [
        'nombre',
        'codigo_dane',
        'municipio_id',
        'geometry'
    ];
}
