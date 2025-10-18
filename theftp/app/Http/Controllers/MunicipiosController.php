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

    /**
     * Display a listing of the resource.
     */

    // TODO: Añadir documentación Swagger
    public function index(Request $request){
        return $this->index($request);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request){

        // Ejecución de validaciones

        return $this->store($request);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(string $id, Request $request){
        // Ejecución de validaciones

    }

    /**
     * Disable the specified resource from storage.
     */
    public function disable(string $id)
    {
        // Ejecución de validaciones
    }

    /**
     * Rehabilitate the specified resource from storage.
     */
    public function rehabilitate(string $id){
        // Ejecución de validaciones
    }


}
