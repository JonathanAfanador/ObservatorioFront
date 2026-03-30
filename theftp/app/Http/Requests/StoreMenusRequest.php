<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'name'     => 'required|string',
            'icon'     => 'nullable|string',
            'url'      => 'nullable|string',
            'padre_id' => 'required|integer|exists:menus,id',
        ];
    }

    public function messages(): array
    {
        return [

            'name.required'     => 'El campo nombre es obligatorio.',
            'name.string'       => 'El campo nombre debe ser una cadena de texto.',
            'icon.string'       => 'El campo icono debe ser una cadena de texto.',
            'url.string'        => 'El campo url debe ser una cadena de texto.',
            'padre_id.required' => 'El campo padre_id es obligatorio.',
            'padre_id.integer'  => 'El campo padre_id debe ser un número entero.',
            'padre_id.exists'   => 'El menú padre especificado no existe.',
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