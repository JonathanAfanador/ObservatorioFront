<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class departamentos extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\DepartamentosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

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
