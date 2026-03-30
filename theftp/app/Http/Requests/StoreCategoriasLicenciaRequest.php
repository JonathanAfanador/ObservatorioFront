<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoriasLicenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'codigo'      => 'required|string|max:150',
            'descripcion' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [

            'codigo.required'      => 'El campo código es obligatorio.',
            'codigo.string'        => 'El campo código debe ser una cadena de texto.',
            'codigo.max'           => 'El campo código no debe exceder 150 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'El campo descripción debe ser una cadena de texto.',
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