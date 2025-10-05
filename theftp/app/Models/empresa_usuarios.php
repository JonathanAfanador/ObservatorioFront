<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class empresa_usuarios extends Model
{
    /** @use HasFactory<\Database\Factories\EmpresaUsuariosFactory> */
    use HasFactory;

    protected $table = 'empresa_usuarios';

    protected $fillable = [
        'empresa_id',
        'user_id',
    ];

    public function empresa(){
        return $this->belongsTo(empresas::class, 'empresa_id');
    }

    public function user(){
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
