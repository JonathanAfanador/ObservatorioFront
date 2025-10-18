<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Models\municipios;

use Illuminate\Http\Request;

class MunicipiosController extends Controller{

    // constructor
    public function __construct(){
        parent::__construct(new municipios(), Tablas::MUNICIPIOS);
    }

    public function index(Request $request){
        return $this->fetchData($request);
    }

}
