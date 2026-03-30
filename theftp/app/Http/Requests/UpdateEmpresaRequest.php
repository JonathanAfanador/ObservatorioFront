<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmpresaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('empresa');

        return [
            'nit'             => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('empresas', 'nit')
                    ->ignore($id)
                    ->whereNull('deleted_at'),
            ],
            'name'            => 'required|string|max:255',
            'tipo_empresa_id' => 'required|integer|exists:tipo_empresa,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nit.required'             => 'El campo NIT es obligatorio.',
            'nit.string'               => 'El campo NIT debe ser una cadena de texto.',
            'nit.max'                  => 'El campo NIT no debe exceder 255 caracteres.',
            'name.required'            => 'El campo nombre es obligatorio.',
            'name.string'              => 'El campo nombre debe ser una cadena de texto.',
            'name.max'                 => 'El campo nombre no debe exceder 255 caracteres.',
            'tipo_empresa_id.required' => 'El campo tipo de empresa es obligatorio.',
            'tipo_empresa_id.integer'  => 'El campo tipo de empresa debe ser un número entero.',
            'tipo_empresa_id.exists'   => 'El tipo de empresa especificado no existe.',
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
