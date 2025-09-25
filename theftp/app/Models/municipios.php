<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class municipios extends Model
{
    /** @use HasFactory<\Database\Factories\MunicipiosFactory> */
    use HasFactory;


    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'municipios';

    protected $fillable = [
        'nombre',
        'codigo_dane',
        'departamento_id',
        'geometry'
    ];
}
