<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropietariosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'fecha_registro'  => 'nullable|date',
            'persona_id'      => 'required|integer|exists:personas,id',
            'empresa_id'      => 'required|integer|exists:empresas,id',
            'archivo_tarjeta' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096', // Máximo 4MB
        ];
    }

    public function messages(): array
    {
        return [

            'fecha_registro.date'   => 'La fecha de registro debe ser una fecha válida.',
            'documento_id.required' => 'El campo documento_id es obligatorio.',
            'documento_id.integer'  => 'El campo documento_id debe ser un número entero.',
            'documento_id.exists'   => 'El documento seleccionado no existe.',
            'persona_id.required'   => 'Debe asociar una persona al propietario.',
            'persona_id.exists'     => 'La persona seleccionada no existe.'
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