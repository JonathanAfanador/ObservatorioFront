<?php

namespace App\Enums;

class Acciones
{
  const CREATE = 'create';
  const READ = 'read';
  const UPDATE = 'update';
  const DELETE = 'delete';

  public static function getValues()
  {
      return [
          self::CREATE,
          self::READ,
          self::UPDATE,
          self::DELETE
      ];

  }
}