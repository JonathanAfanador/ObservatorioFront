<?php

namespace App\Enums;

class Tablas{
  const DEPARTAMENTOS = 'departamentos';
  const BARRIOS = 'barrios';
  const CATEGORIAS_LICENCIAS = 'categorias_licencias';
  const CONDUCTORES = 'conductores';
  const CONDUCTORES_LICENCIAS = 'conductores_licencias';
  const EMPRESA_USUARIO = 'empresa_usuario';
  const EMPRESAS = 'empresas';
  const LICENCIAS = 'licencias';
  const MENUS = 'menus';
  const MUNICIPIOS = 'municipios';
  const PERMISOS = 'permisos';
  const PERSONAS = 'personas';
  const PROPIETARIOS = 'propietarios';
  const RESTRICCION_LIC = 'restriccion_lic';
  const ROL = 'rol';
  const ROLES_MENUS = 'roles_menus';
  const RUTAS = 'rutas';
  const SEGUIM_ESTADO_VEH = 'seguim_estado_veh';
  const SEGUIM_GPS = 'seguim_gps';
  const TIPO_DOC = 'tipo_doc';
  const TIPO_IDENT = 'tipo_ident';
  const TIPO_VEHICULO = 'tipo_vehiculo';
  const USERS = 'users';
  const VEHICULO = 'vehiculo';
  const AUDITORIA = 'auditoria';

  public static function getValues()
  {
      return [
          self::DEPARTAMENTOS,
          self::BARRIOS,
          self::CATEGORIAS_LICENCIAS,
          self::CONDUCTORES,
          self::CONDUCTORES_LICENCIAS,
          self::EMPRESA_USUARIO,
          self::EMPRESAS,
          self::LICENCIAS,
          self::MENUS,
          self::MUNICIPIOS,
          self::PERMISOS,
          self::PERSONAS,
          self::PROPIETARIOS,
          self::RESTRICCION_LIC,
          self::ROL,
          self::ROLES_MENUS,
          self::RUTAS,
          self::SEGUIM_ESTADO_VEH,
          self::SEGUIM_GPS,
          self::TIPO_DOC,
          self::TIPO_IDENT,
          self::TIPO_VEHICULO,
          self::USERS,
          self::VEHICULO,
          self::AUDITORIA,
      ];

  }
}
