<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class permisos extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\PerimosFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'permisos';

    protected $fillable = [
        'create',
        'read',
        'update',
        "delete",
    ];

    public function rol(){
        return $this->belongsTo(rol::class, 'rol_id');
    }
}
