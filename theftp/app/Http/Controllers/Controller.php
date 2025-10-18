<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use Illuminate\Database\Eloquent\Model;

/**
 *  @OA\PathItem(path="/api/v1")
 *  @OA\Info(
 *     title="Observatorio de Transporte Público API",
 *     version="1.0.0",
 *     description="Backend y API Acceso a datos.",
 *     @OA\Contact(
 *         email="juan-vega6@upc.edu.co"
 *     ),
 *     @OA\License(
 *         name="@Universidad Piloto de Colombia SAM - Todos los Derechos Reservados",
 *     )
 * )
 *
 *  @OA\SecurityScheme(
 *     type="http",
 *     description="Sanctum Token Bearer",
 *     name="Authorization",
 *     in="header",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="sanctum"
 * )
 */
abstract class Controller{

    // Contructor que recibe un Model con el que trabajara el controlador
    protected $model;
    protected $table = "";

    public function __construct(Model $model, Tablas $table){
        $this->model = $model;
        $this->table = $table;
    }

    public function fetchData(){
        $data = $this->model->select("*")->get();
        return $data;
    }

}
