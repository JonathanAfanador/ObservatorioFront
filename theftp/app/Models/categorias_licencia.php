<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class categorias_licencia extends Model
{
    /** @use HasFactory<\Database\Factories\CategoriasLicenciaFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'categorias_licencias';

    protected $fillable = [
        'descripcion',
        'servicio',
    ];
}
