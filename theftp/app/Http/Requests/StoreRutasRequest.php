<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRutasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'name'          => 'required|string|max:255',
            'empresa_id'    => 'required|integer|exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [

            'name.required'           => 'El campo nombre es obligatorio.',
            'name.string'             => 'El campo nombre debe ser una cadena de texto.',
            'name.max'                => 'El campo nombre no debe exceder 255 caracteres.',
            'empresa_id.required'     => 'El campo empresa es obligatorio.',
            'empresa_id.integer'      => 'El campo empresa debe ser un número entero.',
            'empresa_id.exists'       => 'La empresa especificada no existe.',
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