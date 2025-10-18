<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class tipo_doc extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\TipoDocFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    /**
    * La tabla asociada con el modelo.
    */
    protected $table = 'tipo_doc';

    protected $fillable = [
        'descripcion',
    ];

    public function documentos(){
        return $this->hasMany(documentos::class, 'tipo_doc_id');
    }
}
