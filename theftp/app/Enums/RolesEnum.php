<?php

namespace App\Enums;

enum RolesEnum: int
{
    case ADMIN = 1;         // Super Admin / Admin
    case SECRETARIA = 2;    // Secretaría de Tránsito
    case EMPRESA = 3;       // Empresa de Transporte
    case OPERADOR = 4;      // UPC / Operador Terreno
    case INVITADO = 5;      // Invitado / Transeúnte
    case SUBADMIN = 6;      // Sub-Admin
}
