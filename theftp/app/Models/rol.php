<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class rol extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RolFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'rol';

    /**
    * Los atributos que son asignables masivamente.
    */
    protected $fillable = [
        'descripcion',
    ];

    // Relación con el modelo User (un rol puede tener muchos usuarios)
    public function users(){
        return $this->hasMany(User::class, 'rol_id');
    }

    public function permisos(){
        return $this->hasMany(permisos::class, 'rol_id');
    }
}
