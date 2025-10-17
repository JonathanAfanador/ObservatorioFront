<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class empresas extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\EmpresasFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $table = 'empresas';

    protected $fillable = [
        'nit',
        'name',
        'tipo_empresa',
    ];

    public function usuarios(){
        return $this->hasMany(User::class, 'empresa_id');
    }
}
