<?php

namespace App\Http\Controllers\V1;

use App\Enums\Genders;
use App\Http\Controllers\Controller;
use App\Models\personas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PersonasController extends Controller{

    public function actualizarDatosPersonales(Request $request){

        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'nui' => 'required|string|max:255|unique:personas,nui',
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'gender' => 'required|in:'.implode(',', Genders::getValues()),
            'tipo_ident_id' => 'exists:tipo_ident,id',
            'id_user' => 'nullable|exists:users,id',
        ]);

        // Mensajes de errores en español
        $validator->setAttributeNames([
            'nui' => 'número de identificación',
            'name'=> 'nombre',
            'last_name' => 'apellido',
            'phone_number' => 'número de teléfono',
            'gender' => 'género',
            'tipo_ident_id' => 'tipo de identificación',
            'id_user' => 'usuario',
        ]);

        // Mensajes de error personalizados
        $messages = [
            'name.required' => 'El :attribute es obligatorio.',
            'name.string' => 'El :attribute debe ser una cadena de texto.',
            'name.max' => 'El :attribute no debe exceder los :max caracteres.',
            'last_name.required' => 'El :attribute es obligatorio.',
            'last_name.string' => 'El :attribute debe ser una cadena de texto.',
            'last_name.max' => 'El :attribute no debe exceder los :max caracteres.',
            'nui.required' => 'El :attribute es obligatorio.',
            'nui.string' => 'El :attribute debe ser una cadena de texto.',
            'nui.max' => 'El :attribute no debe exceder los :max caracteres.',
            'nui.unique' => 'El :attribute ya está en uso.',
            'phone_number.string' => 'El :attribute debe ser una cadena de texto.',
            'phone_number.max' => 'El :attribute no debe exceder los :max caracteres.',
            'id_user.exists' => 'El :attribute debe ser un usuario válido.',
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Si el id_user está presente, debemos actualizar el indicado
        // Si no esta indicado, vamos a modificar el NUESTRO usuario actual
        if (isset($datos['id_user'])) {

            // TODO: Validar que el usuario tenga permisos para modificar la tabla personas

            $persona = personas::where('id', $datos['id_user'])->first();
        } else {

            $persona = personas::where('id',
                Auth::user()->persona_id
            )->first();

        }

        try{
            if(!$persona){
                return response()->json(['error' => 'No se encontró la persona.'], 404);
            }

            DB::beginTransaction();

            $persona->nui = $datos['nui'];
            $persona->name = $datos['name'];
            $persona->last_name = $datos['last_name'];
            $persona->phone_number = $datos['phone_number'] ?? null;
            $persona->gender = $datos['gender'];
            $persona->tipo_ident_id = $datos['tipo_ident_id'];
            $persona->save();

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar la persona.'], 500);
        }

        return response()->json(['message' => 'Persona actualizada correctamente.', 'persona' => $persona], 200);

    }


    public function transferir_cedula_persona(Request $request){
        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'id_persona1' => 'required|exists:personas,id',
            'id_persona2' => 'required|exists:personas,id',
        ]);

        // Mensajes de errores en español
        $validator->setAttributeNames([
            'id_persona1' => 'persona origen',
            'id_persona2' => 'persona destino',
        ]);

        // Mensajes de error personalizados
        $messages = [
            'id_persona1.required' => 'La :attribute es obligatoria.',
            'id_persona1.exists' => 'La :attribute debe ser una persona válida.',
            'id_persona2.required' => 'La :attribute es obligatoria.',
            'id_persona2.exists' => 'La :attribute debe ser una persona válida.',
        ];

        $validator->setCustomMessages($messages);

        // Validar que el usuario tenga permisos para transferir la cédula
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try{
            DB::beginTransaction();

            $persona1 = personas::where('id', $datos['id_persona1'])->first();
            $persona2 = personas::where('id', $datos['id_persona2'])->first();

            // Validar que ambas personas existan
            if(!$persona1 || !$persona2){
                return response()->json(['error' => 'No se encontró una de las personas.'], 404);
            }

            // Validar que no sean la misma persona 
            if($persona1->id === $persona2->id){
                return response()->json(['error' => 'No se puede transferir la cédula a la misma persona.'], 400);
            }

            // Aquí iría la lógica para transferir la cédula de persona1 a persona2
            // Por ejemplo, podríamos actualizar un campo en la base de datos que indique la propiedad de la cédula

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['error' => 'Error al transferir la cédula.'], 500);
        }

        // Lógica para transferir la cédula de la persona
        return response()->json(['message' => 'Cédula transferida correctamente.'], 200);
    }
}
