<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nui'           => 'required|string|max:255|unique:personas,nui',
            'name'          => 'required|string|max:255',
            'last_name'     => 'required|string|max:255',
            'phone_number'  => 'required|string|max:255',
            'gender'        => 'required|in:Mujer,Hombre',
            'tipo_ident_id' => 'required|integer|exists:tipo_ident,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nui.required'           => 'El campo NUI es obligatorio.',
            'nui.string'             => 'El campo NUI debe ser una cadena de texto.',
            'nui.max'                => 'El campo NUI no debe exceder 255 caracteres.',
            'nui.unique'             => 'El NUI ya está registrado.',
            'name.required'          => 'El campo nombre es obligatorio.',
            'last_name.required'     => 'El campo apellidos es obligatorio.',
            'phone_number.required'  => 'El campo teléfono es obligatorio.',
            'gender.required'        => 'El campo género es obligatorio.',
            'gender.in'              => 'El género debe ser "Mujer" o "Hombre".',
            'tipo_ident_id.required' => 'El campo tipo_ident_id es obligatorio.',
            'tipo_ident_id.integer'  => 'El campo tipo_ident_id debe ser un número entero.',
            'tipo_ident_id.exists'   => 'El tipo de identificación especificado no existe.',
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
