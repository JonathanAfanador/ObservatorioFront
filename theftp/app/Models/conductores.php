<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class conductores extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\ConductoresFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

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
