<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use Illuminate\Database\Eloquent\Model;

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
