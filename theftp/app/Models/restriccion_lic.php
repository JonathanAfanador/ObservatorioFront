<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class restriccion_lic extends Model
{
    /** @use HasFactory<\Database\Factories\RestriccionLicFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'restriccion_lic';

    protected $fillable = [
        'descripcion',
    ];
}
