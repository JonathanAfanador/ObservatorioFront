<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConductoresLicenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'licencia_id' => 'required|integer|exists:licencias,id',
            'conductor_id'=> 'required|integer|exists:conductores,id',
        ];
    }

    public function messages(): array
    {
        return [

            'licencia_id.required' => 'La licencia es obligatoria.',
            'licencia_id.integer'  => 'El identificador de licencia debe ser un número entero.',
            'licencia_id.exists'   => 'La licencia seleccionada no existe.',
            'conductor_id.required'=> 'El conductor es obligatorio.',
            'conductor_id.integer' => 'El identificador de conductor debe ser un número entero.',
            'conductor_id.exists'  => 'El conductor seleccionado no existe.',
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