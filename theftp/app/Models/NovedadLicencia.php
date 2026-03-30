<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NovedadLicencia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'novedades_licencias';

    protected $fillable = [
        'licencia_id',
        'tipo_novedad',
        'fecha_inicio',
        'fecha_fin',
        'observaciones'
    ];

    public function licencia()
    {
        return $this->belongsTo(Licencia::class);
    }
}
