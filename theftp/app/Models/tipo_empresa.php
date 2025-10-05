<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tipo_empresa extends Model
{
    /** @use HasFactory<\Database\Factories\TipoEmpresaFactory> */
    use HasFactory;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_empresa';

    protected $fillable = [
        'descripcion',
    ];

    // Relación con el modelo User (un tipo de empresa puede tener muchos usuarios)
    public function users(){
        return $this->hasMany(User::class, 'tipo_empresa_id');
    }
}
