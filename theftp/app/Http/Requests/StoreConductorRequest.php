<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConductorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'persona_id' => [
                'required',
                'integer',
                'exists:personas,id',
                \Illuminate\Validation\Rule::unique('conductores', 'persona_id')
                    ->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'persona_id.required' => 'El campo persona es obligatorio.',
            'persona_id.integer'  => 'El campo persona debe ser un número entero.',
            'persona_id.exists'   => 'La persona especificada no existe.',
            'persona_id.unique'   => 'Esta persona ya está registrada como conductor activo.',
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
