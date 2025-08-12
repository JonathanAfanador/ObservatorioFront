<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller{

    public function helloWorld(){
        return response()->json(['message' => 'Hola Mundo desde AuthController']);
    }

    public function registro(Request $request){

        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|max:255',
            'arreglo' => 'array',
            // 'arreglo.0' => 'string|max:255',
            // 'arreglo.*' => 'string|max:255',
        ]);

        // Mensajes de errores en español
        $validator->setAttributeNames([
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'name'=> 'nombre',
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
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // User::create([
        //     'email' => $datos['email'],
        //     'password' => bcrypt($datos['password']),
        // ]);

        $usuario = new User();
        $usuario->name = $datos['name'];
        $usuario->email = $datos['email'];
        $usuario->password = $datos['password'];
        $usuario->save();

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
