<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class barrios extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\BarriosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'barrios';

    protected $fillable = [
        'name',
        'municipios'
    ];

    public function municipio(){
        return $this->belongsTo(municipios::class, 'municipio_id');
    }
}
