<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConductorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Se extrae el ID de la ruta actual (ej. /api/conductores/{id})
        $id = $this->route('id') ?? $this->route('conductore');

        return [
            'persona_id' => [
                'required',
                'integer',
                'exists:personas,id',
                \Illuminate\Validation\Rule::unique('conductores', 'persona_id')
                    ->ignore($id)
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
