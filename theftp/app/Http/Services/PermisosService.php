<?php

namespace App\Http\Services;

use App\Enums\Tablas;
use App\Enums\Acciones;
use Exception;
use Illuminate\Support\Facades\Auth;

class PermisosService
{
  const VALIDAR = true; // Cambiar a false para desactivar la validación

  /*

  Implementación de middleware para los crud de cada tabla, si no se puede crear un servicio global (un archivo .php que contenga una función que reciba un arreglo de permisos. Ej:
  [
    [
      'tabla' => TABLA::USERS,
      'acciones' => [
        ACTION:CREATE,
        ACTION:READ
      ]
    ],
    [
      'tabla' => TABLA::ROLES,
      'acciones' => [
        ACTION:CREATE,
        ACTION:READ,
        ACTION:DELETE
      ]
    ],
  ]

  */

  private static function throwNotPermission(){
    throw new Exception("No tiene permisos para realizar esta acción", 403);
  }

  public static function verificarPermisoIndividual($tabla, ...$permisos){
    return self::verificarPermisos([
      [
        'tabla' => $tabla->value ?? $tabla,
        'acciones' => $permisos
      ]
    ]);
  }

  public static function verificarPermisos( $arrayPermisos )
  {
    $TABLAS = Tablas::getValues();
    $ACCIONES = Acciones::getValues();

    foreach ($arrayPermisos as $permiso) {
      if (!in_array($permiso['tabla'], $TABLAS)) {
        throw new Exception("Tabla inválida: " . $permiso['tabla']);
      }

      foreach ($permiso['acciones'] as $accion) {
        if (!in_array($accion, $ACCIONES)) {
          throw new Exception("Acción inválida: " . $accion);
        }
      }
    }

    if(count($arrayPermisos) === 0){
      throw new Exception("No se han especificado permisos a verificar", 400);
    }

    if (!self::VALIDAR) {
      return true; // Si la validación está desactivada, siempre retorna true, de tener permisos
    }

    $usuario = Auth::user()->load(['rol', 'rol.permisos']);
    /*

"usuario": {
        "id": 1,
        "name": "Admin Sistema",
        "email": "admin@example.com",
        "unable": false,
        "unable_date": null,
        "email_verified_at": "2025-10-16T13:14:15.000000Z",
        "persona_id": 20,
        "rol_id": 1,
        "created_at": null,
        "updated_at": null,
        "deleted_at": null,
        "rol": {
            "id": 1,
            "descripcion": "Administrador",
            "created_at": null,
            "updated_at": null,
            "deleted_at": null,
            "permisos": [
                {
                    "id": 2,
                    "tabla": "users",
                    "create": true,
                    "read": false,
                    "update": false,
                    "delete": false,
                    "rol_id": 1,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                }
            ]
        }
    },

    */

    if( !$usuario || !$usuario->rol ){
      self::throwNotPermission();
    }

    $permisosRol = $usuario->rol->permisos; // Colección de permisos asociados al rol del usuario

    if ( !$permisosRol || $permisosRol->isEmpty() ) {
      self::throwNotPermission();
    }

    foreach ($arrayPermisos as $permiso) {
      $tabla = $permiso['tabla']->value ?? $permiso['tabla'];
      $acciones = $permiso['acciones'];

      // Buscar el permiso correspondiente en los permisos del rol
      $permisoRol = $permisosRol->firstWhere('tabla', $tabla);

      if (!$permisoRol) {
        self::throwNotPermission();
      }

      // Verificar cada acción requerida
      foreach ($acciones as $accion) {
        if (!$permisoRol->$accion) { // Acceder dinámicamente a la propiedad (create, read, update, delete)
          self::throwNotPermission();
        }
      }
    }

    return true; // Si pasa todas las verificaciones, tiene los permisos necesarios
  }

}
