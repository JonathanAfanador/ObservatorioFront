<?php

namespace App\Enums;

class Genders
{
    const MALE = 'Hombre';
    const FEMALE = 'Mujer';

    public static function getValues()
    {
        return [
            self::MALE,
            self::FEMALE
        ];

    }
}
