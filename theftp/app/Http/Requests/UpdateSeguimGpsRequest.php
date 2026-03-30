<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeguimGpsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'latitud'     => 'nullable|numeric|between:-90,90',
            'longitud'    => 'nullable|numeric|between:-180,180',
            'fecha_hora'  => 'nullable|date',
            'vehiculo_id' => 'nullable|integer|exists:vehiculo,id',
        ];
    }

    public function messages(): array
    {
        return [

            'latitud.numeric'     => 'La latitud debe ser numérica.',
            'latitud.between'     => 'La latitud debe estar entre -90 y 90.',
            'longitud.numeric'    => 'La longitud debe ser numérica.',
            'longitud.between'    => 'La longitud debe estar entre -180 y 180.',
            'fecha_hora.date'     => 'La fecha y hora no tiene un formato válido.',
            'vehiculo_id.integer' => 'El identificador de vehículo debe ser un número entero.',
            'vehiculo_id.exists'  => 'El vehículo seleccionado no existe.',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422));
    }
}