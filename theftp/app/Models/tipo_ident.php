<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class tipo_ident extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoIdentFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_ident';

    protected $fillable = [
        'descripcion',
    ];
}
