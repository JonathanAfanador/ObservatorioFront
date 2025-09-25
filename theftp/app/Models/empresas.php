<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class empresas extends Model
{
    /** @use HasFactory<\Database\Factories\EmpresasFactory> */
    use HasFactory;

    protected $table = 'empresas';

    protected $fillable = [
        'nombre',
        'ruc',
        'direccion',
        'telefono',
    ];

    public function usuarios(){
        return $this->hasMany(User::class, 'empresa_id');
    }
}
