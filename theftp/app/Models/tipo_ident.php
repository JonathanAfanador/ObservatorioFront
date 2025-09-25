<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tipo_ident extends Model
{
    /** @use HasFactory<\Database\Factories\TipoIdentFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_ident';

    protected $fillable = [
        'descripcion',
    ];
}
