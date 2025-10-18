<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class roles_menu extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\RolesMenuFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $table = 'roles_menus';

    protected $fillable = [
        'rol_id',
        'menu_id',
    ];

    public function rol(){
        return $this->belongsTo(rol::class, 'rol_id');
    }

    public function menu(){
        return $this->belongsTo(menus::class, 'menu_id');
    }
}
