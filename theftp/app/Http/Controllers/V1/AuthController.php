<?php

namespace App\Http\Controllers\V1;

use App\Enums\Genders;
use App\Http\Controllers\Controller;
use App\Models\personas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Enum;



class AuthController extends Controller{

    const ROL_PORDEFECTO = 5;

    public function helloWorld(){
        return response()->json(['message' => 'Hola Mundo desde AuthController']);
    }

    public function registro(Request $request){

        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'nui' => 'required|string|max:255|unique:personas,nui',
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'gender' => 'required|in:'.implode(',', Genders::getValues()),
            'tipo_ident_id' => 'exists:tipo_ident,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|max:255',
        ]);


        // Mensajes de errores en español
        $validator->setAttributeNames([
            'nui' => 'número de identificación',
            'name'=> 'nombre',
            'last_name' => 'apellido',
            'phone_number' => 'número de teléfono',
            'gender' => 'género',
            'tipo_ident_id' => 'tipo de identificación',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
        ]);

        // Mensajes de error personalizados
        $messages = [
            'email.required' => 'El :attribute es obligatorio.',
            'email.email' => 'El :attribute debe ser un correo electrónico válido.',
            'email.unique' => 'El :attribute ya está en uso.',
            'password.required' => 'La :attribute es obligatoria.',
            'password.min' => 'La :attribute debe tener al menos :min caracteres.',
            'password.max' => 'La :attribute no debe exceder los :max caracteres.',
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
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {

            DB::beginTransaction();

            //Crear la persona
            $persona = new personas();
            $persona->nui = $datos['nui'];
            $persona->name = $datos['name'];
            $persona->last_name = $datos['last_name'];
            $persona->phone_number = $datos['phone_number'] ?? null;
            $persona->gender = $datos['gender'];
            $persona->tipo_ident_id = $datos['tipo_ident_id'];
            $persona->save();

            $usuario = new User();
            $usuario->name = $datos['name'];
            $usuario->email = $datos['email'];
            $usuario->password = bcrypt($datos['password']);
            $usuario->unable = false;
            $usuario->unable_date = null;
            $usuario->email_verified_at = null;
            $usuario->persona_id = $persona->id;
            $usuario->rol_id = $this::ROL_PORDEFECTO;
            $usuario->save();

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['message' => 'Error al registrar el usuario', 'error' => $th->getMessage()], 500);
        }

        return response()->json(['message' => 'Usuario registrado exitosamente'], 201);
    }

    public function login(Request $request){

        $datos = $request->all();

        $validator = Validator::make($datos, [
            'email' => 'required|email',
            'password' => 'required|string|min:6|max:255',
        ]);

        $validator->setAttributeNames([
            'email' => 'correo electrónico',
            'password' => 'contraseña',
        ]);

        $messages = [
            'email.required' => 'El :attribute es obligatorio.',
            'email.email' => 'El :attribute debe ser un correo electrónico válido.',
            'password.required' => 'La :attribute es obligatoria.',
            'password.min' => 'La :attribute debe tener al menos :min caracteres.',
            'password.max' => 'La :attribute no debe exceder los :max caracteres.',
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if(Auth::attempt(['email'=> $datos['email'],'password'=> $datos['password']])){

            $tiempoExpiracion = 120; // 120 minutos

            $tokenBearer = Auth::user()->createToken('token', ["*"], now()->addMinutes($tiempoExpiracion))->plainTextToken;

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'token' => $tokenBearer
            ], 200);

        }

        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

}
