<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehiculoRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     */
    public function authorize(): bool
    {
        return true; // Autorización manejada por el middleware CheckRole
    }

    /**
     * Prepara los datos antes de la validación.
     */
    protected function prepareForValidation()
    {
        if (!$this->has('servicio')) {
            $this->merge(['servicio' => false]);
        }
    }

    /**
     * Reglas de validación.
     */
    public function rules(): array
    {
        return [
            'color'          => 'required|string|max:255',
            'marca'          => 'required|string|max:255',
            'placa'          => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('vehiculo', 'placa')->whereNull('deleted_at'),
            ],
            'modelo'         => 'required|string|max:255',
            'servicio'       => 'nullable|boolean',
            'propietario_id' => 'required|integer|exists:propietarios,id',
            'tipo_veh_id'    => 'required|integer|exists:tipo_vehiculo,id',
            'fecha_matricula'        => 'required|date',
            'fecha_expedicion_soat'  => 'required|date',
            'fecha_vencimiento_soat' => 'required|date',
            'fecha_expedicion_tecno' => 'required|date',
            'fecha_vencimiento_tecno'=> 'required|date',
            'documento_soat_id'      => 'nullable|integer|exists:documentos,id',
            'documento_tecno_id'     => 'nullable|integer|exists:documentos,id',
        ];
    }

    /**
     * Mensajes personalizados de error.
     */
    public function messages(): array
    {
        return [
            'color.required'          => 'El color es obligatorio.',
            'marca.required'          => 'La marca es obligatoria.',
            'placa.required'          => 'La placa es obligatoria.',
            'modelo.required'         => 'El modelo es obligatorio.',
            'color.string'            => 'El color debe ser texto.',
            'marca.string'            => 'La marca debe ser texto.',
            'placa.string'            => 'La placa debe ser texto.',
            'modelo.string'           => 'El modelo debe ser texto.',
            'servicio.boolean'        => 'El campo servicio debe ser verdadero o falso.',
            'propietario_id.required' => 'El propietario es obligatorio.',
            'propietario_id.integer'  => 'El propietario debe ser un número entero.',
            'propietario_id.exists'   => 'El propietario seleccionado no existe.',
            'tipo_veh_id.required'    => 'El tipo de vehículo es obligatorio.',
            'tipo_veh_id.integer'     => 'El tipo de vehículo debe ser un número entero.',
            'tipo_veh_id.exists'      => 'El tipo de vehículo seleccionado no existe.',
        ];
    }

    /**
     * Maneja el error de validación manteniendo la estructura JSON original del Frontend.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422));
    }
}
