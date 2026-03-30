<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermisosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'tabla'  => 'required|string|max:255',
            'create' => 'required|boolean',
            'read'   => 'required|boolean',
            'update' => 'required|boolean',
            'delete' => 'required|boolean',
            'rol_id' => 'required|integer|exists:rol,id',
        ];
    }

    public function messages(): array
    {
        return [

            'tabla.required'  => 'El campo tabla es obligatorio.',
            'tabla.string'    => 'El campo tabla debe ser una cadena de texto.',
            'tabla.max'       => 'El campo tabla no debe exceder 255 caracteres.',
            'create.required' => 'El permiso de creación es obligatorio.',
            'create.boolean'  => 'El permiso de creación debe ser verdadero o falso.',
            'read.required'   => 'El permiso de lectura es obligatorio.',
            'read.boolean'    => 'El permiso de lectura debe ser verdadero o falso.',
            'update.required' => 'El permiso de actualización es obligatorio.',
            'update.boolean'  => 'El permiso de actualización debe ser verdadero o falso.',
            'delete.required' => 'El permiso de eliminación es obligatorio.',
            'delete.boolean'  => 'El permiso de eliminación debe ser verdadero o falso.',
            'rol_id.required' => 'El campo rol_id es obligatorio.',
            'rol_id.integer'  => 'El campo rol_id debe ser un número entero.',
            'rol_id.exists'   => 'El rol especificado no existe.',
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