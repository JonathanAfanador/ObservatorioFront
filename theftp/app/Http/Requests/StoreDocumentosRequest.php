<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [

            'observaciones' => 'required|string',
            'tipo_doc_id'   => 'required|integer|exists:tipo_doc,id',
            'empresa_id' => 'nullable|integer|exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [

            'observaciones.required'   => 'El campo observaciones es obligatorio.',
            'tipo_doc_id.required'     => 'El campo tipo_doc_id es obligatorio.',
            'tipo_doc_id.integer'      => 'El campo tipo_doc_id debe ser un número entero.',
            'tipo_doc_id.exists'       => 'El tipo de documento especificado no existe.',
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