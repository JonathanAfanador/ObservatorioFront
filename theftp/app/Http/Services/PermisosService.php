<?php

use App\Enums\Tablas;
use App\Enums\Acciones;

class PermisosService
{
  const ACCIONES = Acciones::getValues();
  const TABLAS = Tablas::getValues();

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
  public static function verificarPermisos( $arrayPermisos )
  {
    foreach ($arrayPermisos as $permiso) {
      if (!in_array($permiso['tabla'], self::TABLAS)) {
        throw new Exception("Tabla inválida: " . $permiso['tabla']);
      }

      foreach ($permiso['acciones'] as $accion) {
        if (!in_array($accion, self::ACCIONES)) {
          throw new Exception("Acción inválida: " . $accion);
        }
      }
    }

    // TODO: Lógica aquí

    return true;
  }

}