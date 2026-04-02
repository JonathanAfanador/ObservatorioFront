<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paradero extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $table = 'paraderos';

    protected $fillable = [
        'ruta_id',
        'name',
        'description',
        'lat',
        'lng',
        'estado',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'estado' => 'boolean',
    ];

    /**
     * Relación con la Ruta a la que pertenece este paradero
     */
    public function ruta()
    {
        return $this->belongsTo(Ruta::class);
    }
}
