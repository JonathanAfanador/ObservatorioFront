<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class roles_menu extends Model
{
    /** @use HasFactory<\Database\Factories\RolesMenuFactory> */
    use HasFactory;

    protected $table = 'roles_menu';

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
