<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class conductores extends Model
{
    /** @use HasFactory<\Database\Factories\ConductoresFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'conductores';

    protected $fillable = [
        'persona_id',
    ];

    // Función para definir la relación con el modelo personas
    public function persona(){
        return $this->belongsTo(personas::class, 'persona_id'); // Relación con el modelo personas
    }
}
