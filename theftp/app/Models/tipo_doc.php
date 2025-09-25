<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tipo_doc extends Model
{
    /** @use HasFactory<\Database\Factories\TipoDocFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipos_doc';

    protected $fillable = [
        'descripcion',
    ];
}
