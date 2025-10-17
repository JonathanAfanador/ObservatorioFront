<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class restriccion_lic extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RestriccionLicFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'restriccion_lic';

    protected $fillable = [
        'descripcion',
    ];
}
