<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class personas extends Model
{
    /** @use HasFactory<\Database\Factories\PersonasFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'personas';


    // Este modelo Eloquent representa la tabla 'personas'.
    // Permite asignación masiva de los campos: nui, name, last_name, phone_number, gender y tipo_ident_id.
    // Incluye constantes para los valores
    protected $fillable = [
        'nui',
        'name',
        'last_name',
        'phone_number',
        'gender',
        'tipo_ident_id',
    ];

    // posibles de género.
    public const GENDER_MUJER = 'Mujer';
    public const GENDER_HOMBRE = 'Hombre';

    // Relación con el modelo TipoIdent

    public function tipo_ident()
    {
        return $this->belongsTo(tipo_ident::class, 'tipo_ident_id');
    }

}
