<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class tipo_empresa extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoEmpresaFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_empresa';

    protected $fillable = [
        'descripcion',
    ];

    // Relación con el modelo empresas (un tipo de empresa puede tener muchas empresas)
    public function empresas(){
        return $this->hasMany(empresas::class, 'tipo_empresa_id');
    }


}
