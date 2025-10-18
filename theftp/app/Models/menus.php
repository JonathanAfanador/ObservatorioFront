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

    // Relación con el modelo Menus (un menú puede tener muchos submenús)
    public function roles_menu(){
        return $this->hasMany(roles_menu::class, 'menu_id');
    }

    // Relación con el menú padre
    public function parent(){
        return $this->belongsTo(self::class, 'padre_id');
    }

    // Hijos directos
    public function submenus(){
        return $this->hasMany(self::class, 'padre_id');
    }

    // Hijos recursivos: carga toda la jerarquía de submenús
    // TODO: Evitar ciclo infinito en caso de padres circulares
    public function submenusRecursive(){
        return $this->submenus()->with('submenusRecursive', 'roles_menu');
    }

    // Scope auxiliar para cargar la jerarquía en una consulta
    public function scopeWithSubmenusRecursive($query){
        return $query->with('submenusRecursive', 'roles_menu');
    }
}
