<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:6|max:255',
        ];
    }

    public function attributes()
    {
        return [
            'email' => 'correo electrónico',
            'password' => 'contraseña',
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'El :attribute es obligatorio.',
            'email.email' => 'El :attribute debe ser un correo electrónico válido.',
            'password.required' => 'La :attribute es obligatoria.',
            'password.min' => 'La :attribute debe tener al menos :min caracteres.',
            'password.max' => 'La :attribute no debe exceder los :max caracteres.',
        ];
    }
}
