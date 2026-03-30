<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTipoVehiculoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'descripcion' => 'required|string|max:255',
            'capacidad'   => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [

            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'La descripción debe ser una cadena de texto.',
            'descripcion.max'      => 'La descripción no debe exceder 255 caracteres.',
            'capacidad.integer'    => 'La capacidad debe ser un número entero.',
            'capacidad.min'        => 'La capacidad no puede ser negativa.',
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