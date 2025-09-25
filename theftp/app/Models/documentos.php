<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class documentos extends Model
{
    /** @use HasFactory<\Database\Factories\DocumentosFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'documentos';

    protected $fillable = [
        'url',
        'observaciones',
        'tipo_doc_id',
    ];

    // Función para definir la relación con el modelo tipos_documentos
    public function tipoDoc(){
        return $this->belongsTo(tipo_doc::class, 'tipo_doc_id'); // Relación con el modelo tipos_documentos
    }
}
