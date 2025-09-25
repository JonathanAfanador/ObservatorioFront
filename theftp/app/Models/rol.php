<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class rol extends Model
{
    /** @use HasFactory<\Database\Factories\RolFactory> */
    use HasFactory;

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
}
