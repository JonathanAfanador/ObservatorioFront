<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class barrios extends Model
{
    /** @use HasFactory<\Database\Factories\BarriosFactory> */
    use HasFactory;

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
