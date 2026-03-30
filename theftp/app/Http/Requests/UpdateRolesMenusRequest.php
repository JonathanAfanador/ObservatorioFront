<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRolesMenusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'rol_id'  => 'required|integer|exists:rol,id',
            'menu_id' => 'required|integer|exists:menus,id',
        ];
    }

    public function messages(): array
    {
        return [

            'rol_id.required'  => 'El campo rol_id es obligatorio.',
            'rol_id.integer'   => 'El campo rol_id debe ser un número entero.',
            'rol_id.exists'    => 'El rol especificado no existe.',
            'menu_id.required' => 'El campo menu_id es obligatorio.',
            'menu_id.integer'  => 'El campo menu_id debe ser un número entero.',
            'menu_id.exists'   => 'El menú especificado no existe.',
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