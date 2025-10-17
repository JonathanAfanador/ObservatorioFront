<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class municipios extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\MunicipiosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

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
