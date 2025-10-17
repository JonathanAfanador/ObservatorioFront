<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class categorias_licencia extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\CategoriasLicenciaFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'categorias_licencias';

    protected $fillable = [
        'codigo',
        'descripcion',
    ];
}
