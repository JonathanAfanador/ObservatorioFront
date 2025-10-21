<?php

namespace App\Enums;

enum Tablas: string {
    case DEPARTAMENTOS = 'departamentos';
    case BARRIOS = 'barrios';
    case CATEGORIAS_LICENCIAS = 'categorias_licencias';
    case CONDUCTORES = 'conductores';
    case CONDUCTORES_LICENCIAS = 'conductores_licencias';
    case EMPRESA_USUARIO = 'empresa_usuario';
    case EMPRESAS = 'empresas';
    case LICENCIAS = 'licencias';
    case MENUS = 'menus';
    case MUNICIPIOS = 'municipios';
    case PERMISOS = 'permisos';
    case PERSONAS = 'personas';
    case PROPIETARIOS = 'propietarios';
    case RESTRICCION_LIC = 'restriccion_lic';
    case ROL = 'rol';
    case ROLES_MENUS = 'roles_menus';
    case RUTAS = 'rutas';
    case SEGUIM_ESTADO_VEH = 'seguim_estado_veh';
    case SEGUIM_GPS = 'seguim_gps';
    case TIPO_DOC = 'tipo_doc';
    case DOCUMENTOS = 'documentos';
    case TIPO_IDENT = 'tipo_ident';
    case TIPO_VEHICULO = 'tipo_vehiculo';
    case USERS = 'users';
    case VEHICULO = 'vehiculo';
    case AUDITORIA = 'auditoria';

    public static function getValues(): array
    {
        return array_map(fn(Tablas $c) => $c->value, self::cases());
    }
}
