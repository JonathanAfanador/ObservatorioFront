<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class departamentos extends Model
{
    /** @use HasFactory<\Database\Factories\DepartamentosFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'departamentos';

    protected $fillable = [
        'nombre',
        'codigo_dane',
        'geometry'
    ];
}
