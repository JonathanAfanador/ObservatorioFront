<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class conductores_licencias extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\CoductoresLicenciasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'conductores_licencias';

    protected $fillable = [
        'conductor_id',
        'licencia_id',
    ];

    // Función para definir la relación con el modelo conductores
    public function conductor(){
        return $this->belongsTo(conductores::class, 'conductor_id'); // Relación con el modelo conductores
    }

    // Función para definir la relación con el modelo licencias
    public function licencia(){
        return $this->belongsTo(licencias::class, 'licencia_id'); // Relación con el modelo licencias
    }
}
