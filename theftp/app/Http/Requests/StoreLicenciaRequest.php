<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLicenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restriccion_lic_id' => 'required|integer|exists:restriccion_lic,id',
            'categoria_lic_id'   => 'required|integer|exists:categorias_licencia,id',
            'documento_id'       => 'required|integer|exists:documentos,id',
        ];
    }

    public function messages(): array
    {
        return [
            'restriccion_lic_id.required' => 'El campo restriccion_lic_id es obligatorio.',
            'restriccion_lic_id.integer'  => 'El campo restriccion_lic_id debe ser un número entero.',
            'restriccion_lic_id.exists'   => 'La restricción de licencia especificada no existe.',
            'categoria_lic_id.required'   => 'El campo categoria_lic_id es obligatorio.',
            'categoria_lic_id.integer'    => 'El campo categoria_lic_id debe ser un número entero.',
            'categoria_lic_id.exists'     => 'La categoría de licencia especificada no existe.',
            'documento_id.required'       => 'El campo documento_id es obligatorio.',
            'documento_id.integer'        => 'El campo documento_id debe ser un número entero.',
            'documento_id.exists'         => 'El documento especificado no existe.',
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
