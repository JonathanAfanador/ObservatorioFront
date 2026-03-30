<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarriosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'name'          => 'required|string|max:255',
            'municipios_id' => 'required|integer|exists:municipios,id',
        ];
    }

    public function messages(): array
    {
        return [

            'name.required'          => 'El campo nombre es obligatorio.',
            'municipios_id.required' => 'El campo municipio es obligatorio.',
            'municipios_id.exists'   => 'El municipio especificado no existe.',
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