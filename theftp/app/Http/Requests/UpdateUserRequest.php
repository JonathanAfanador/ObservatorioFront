<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('user');
        return [
            'name'              => 'required|string|max:255',
            'email'             => [
                'required',
                'string',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'email')
                    ->ignore($id)
                    ->whereNull('deleted_at'),
            ],
            'password'          => 'sometimes|nullable|string|min:8',
            'unable'            => 'sometimes|boolean',
            'unable_date'       => 'nullable|date',
            'email_verified_at' => 'nullable|date',
            'persona_id'        => 'required|integer|exists:personas,id',
            'rol_id'            => 'required|integer|exists:rol,id',
            'empresa_id'        => 'nullable|integer|exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'El campo nombre es obligatorio.',
            'email.required'      => 'El campo email es obligatorio.',
            'email.email'         => 'El campo email debe ser un correo válido.',
            'email.unique'        => 'El correo ya está registrado por otro usuario.',
            'password.min'        => 'La contraseña debe tener al menos 8 caracteres.',
            'persona_id.required' => 'El campo persona es obligatorio.',
            'persona_id.exists'   => 'La persona especificada no existe.',
            'rol_id.required'     => 'El campo rol es obligatorio.',
            'rol_id.exists'       => 'El rol especificado no existe.',
            'empresa_id.exists'   => 'La empresa especificada no existe.',
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
