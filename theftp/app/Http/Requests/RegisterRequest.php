<?php

namespace App\Http\Requests;

use App\Enums\Genders;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'nui' => 'required|string|max:255|unique:personas,nui',
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'gender' => 'required|in:' . implode(',', Genders::getValues()),
            'tipo_ident_id' => 'exists:tipo_ident,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|max:255|confirmed',
        ];
    }

    public function attributes()
    {
        return [
            'nui' => 'número de identificación',
            'name'=> 'nombre',
            'last_name' => 'apellido',
            'phone_number' => 'número de teléfono',
            'gender' => 'género',
            'tipo_ident_id' => 'tipo de identificación',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
        ];
    }

    public function messages()
    {
        return [
            'required' => 'El :attribute es obligatorio.',
            'string' => 'El :attribute debe ser una cadena de texto.',
            'max' => 'El :attribute no debe exceder los :max caracteres.',
            'min' => 'El :attribute debe tener al menos :min caracteres.',
            'email' => 'El :attribute debe ser un correo electrónico válido.',
            'unique' => 'El :attribute ya está en uso.',
            'in' => 'El :attribute seleccionado es inválido.',
            'exists' => 'El :attribute seleccionado no existe.',
        ];
    }
}
