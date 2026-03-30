<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NovedadConductor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'conductor_id',
        'tipo_novedad',
        'fecha_inicio',
        'fecha_fin',
        'observaciones'
    ];

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }
}
