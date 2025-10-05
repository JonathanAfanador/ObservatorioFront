<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class propietarios extends Model
{
    /** @use HasFactory<\Database\Factories\PropietariosFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'propietarios';

    protected $fillable = [
        'fecha_registro',
        'documento_id',
    ];

    // Función para definir la relación con el modelo documentos
    public function documento(){
        return $this->belongsTo(documentos::class, 'documento_id'); // Relación con el modelo documentos
    }
}
