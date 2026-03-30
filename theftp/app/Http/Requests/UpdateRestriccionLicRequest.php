<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestriccionLicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'descripcion' => 'required|string|max:150',
        ];
    }

    public function messages(): array
    {
        return [

            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max'      => 'El campo descripción no debe exceder 150 caracteres.',
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