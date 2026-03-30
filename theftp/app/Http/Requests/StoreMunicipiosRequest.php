<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMunicipiosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'name' => 'required|string|max:255',
            'codigo_dane' => 'required|string|max:255',
            'departamentos_id' => 'required|integer|exists:departamentos,id',
        ];
    }

    public function messages(): array
    {
        return [

            'name.required' => 'El campo nombre es obligatorio.',
            'codigo_dane.required' => 'El campo código DANE es obligatorio.',
            'departamentos_id.required' => 'El campo departamento es obligatorio.',
            'departamentos_id.exists' => 'El departamento especificado no existe.',
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