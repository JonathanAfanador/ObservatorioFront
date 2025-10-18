<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class inicio_sesion extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\InicioSesionFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'inicio_sesion';

    protected $fillable = [
        'usuario_id',
        'fecha_hora_inicio',
        'fecha_ultima_actividad',
        'ip'
    ];

    public function usuario(){
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
