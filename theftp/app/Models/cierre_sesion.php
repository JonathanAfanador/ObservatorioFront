<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class cierre_sesion extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\CierreSesionFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'cierre_sesion';

    protected $fillable = [
        'usuario_id',
        'fecha_hora_cierre',
        'direccion_ip',
    ];

    public function usuario(){
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
