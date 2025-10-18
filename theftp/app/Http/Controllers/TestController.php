<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Models\tipo_ident;

class TestController extends Controller{

    // constructor
    public function __construct(){
        parent::__construct(new tipo_ident(), Tablas::TIPO_IDENT);
    }


    public function index(){
        return $this->fetchData();
    }

}
