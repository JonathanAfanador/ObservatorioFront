<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class menus extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\MenusFactory> */
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $table = 'menus';

    protected $fillable = [
        'name',
        'icon',
        'url',
        'category',
    ];

    // Relación con el modelo Permisos (un menú puede tener muchos permisos)
    public function permisos(){
        return $this->hasMany(permisos::class, 'menu_id');
    }

    // Relación con el modelo Menus (un menú puede tener muchos submenús)
    public function roles_menu(){
        return $this->hasMany(roles_menu::class, 'menu_id');
    }

    // Relación con el modelo Menus (un menú puede tener muchos submenús)
    public function submenus(){
        return $this->hasMany(menus::class, 'parent_id');
    }
}
