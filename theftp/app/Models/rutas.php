<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class rutas extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RutasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'rutas';

    protected $fillable = [
        'nombre',
        'codigo_dane',
        'municipio_id',
        'file_name',
        'empresa_id',
    ];
}
