<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSeguimEstadoVehRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'kilometraje' => 'nullable|integer|min:0',
            'fecha_hora'  => 'nullable|date',
            'observaciones' => 'nullable|string',
            'usuario_id'  => 'required|integer|exists:users,id',
            'vehiculo_id' => 'required|integer|exists:vehiculo,id',
        ];
    }

    public function messages(): array
    {
        return [

            'kilometraje.integer' => 'El kilometraje debe ser un número entero.',
            'kilometraje.min'     => 'El kilometraje no puede ser negativo.',
            'fecha_hora.date'     => 'La fecha y hora no tiene un formato válido.',
            'observaciones.string'=> 'Las observaciones deben ser un texto.',
            'usuario_id.required' => 'El usuario es obligatorio.',
            'usuario_id.integer'  => 'El identificador de usuario debe ser un número entero.',
            'usuario_id.exists'   => 'El usuario seleccionado no existe.',
            'vehiculo_id.required'=> 'El vehículo es obligatorio.',
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