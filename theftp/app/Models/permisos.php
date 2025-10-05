<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class permisos extends Model
{
    /** @use HasFactory<\Database\Factories\PerimosFactory> */
    use HasFactory;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'perimos';

    protected $fillable = [
        'agregar',
        'eliminar',
        'modificar',
        "leer",
    ];
}
