<?php
/**
 * @OA\Tag(
 *     name="Auth",
 *     description="Operaciones relacionadas con la autenticación de usuarios"
 * )
 */
namespace App\Http\Controllers\V1;

use App\Enums\Genders;
use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Models\CierreSesion;
use App\Models\InicioSesion;
use App\Models\Persona;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller{

    public function __construct(){
        parent::__construct(new User(), Tablas::USERS);
    }

    const ROL_PORDEFECTO = 5;

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     summary="Obtener información del usuario autenticado",
     *     tags={"Auth"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Información del usuario autenticado",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado"
     *     )
     * )
     */
    public function me(){
        $usuario = Auth::user();

        $usuario->load(['persona', 'rol.permisos', 'persona.tipo_ident']);

        return $usuario;
    }

    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     summary="Registrar un nuevo usuario",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nui", "name", "last_name", "email", "password", "gender", "tipo_ident_id"},
     *             @OA\Property(property="nui", type="string", example="123456789"),
     *             @OA\Property(property="name", type="string", example="Juan"),
     *             @OA\Property(property="last_name", type="string", example="Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan.perez@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="gender", type="string", example="Hombre"),
     *             @OA\Property(property="tipo_ident_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario registrado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Errores de validación"
     *     )
     * )
     */
    public function registro(RegisterRequest $request){

        $datos = $request->validated();

        try {

            DB::beginTransaction();

            //Crear la persona
            $persona = new Persona();
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

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     summary="Iniciar sesión",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="juan.perez@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Inicio de sesión exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Inicio de sesión exitoso"),
     *             @OA\Property(property="token", type="string", example="Bearer token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales incorrectas"
     *     )
     * )
     */
    public function login(LoginRequest $request){

        $datos = $request->validated();

        // Validación de Usuario valido
        $usuario = User::where('email', $datos['email'])->first();

        if (!$usuario) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Validar si el usuario está inhabilitado
        if ($usuario->unable) {
            return response()->json(['message' => 'El usuario está inhabilitado'], 403);
        }

        // Validar si el usuario fue eliminado
        if ($usuario->deleted_at) {
            return response()->json(['message' => 'El usuario no existe'], 404);
        }

        if(Auth::attempt(['email'=> $datos['email'],'password'=> $datos['password']])){

            // --- CORRECCIÓN AUDITORÍA: InicioSesion se registra SOLO tras login exitoso ---
            InicioSesion::create([
                'direccion_ip' => $request->ip(),
                'fecha_hora_inicio' => now(),
                'fecha_ultima_actividad' => now(),
                'usuario_id' => $usuario->id,
            ]);

            // Sanctum SPA: la sesión se establece automáticamente via cookie HttpOnly.
            // Ya no se genera ni expone un token Bearer para evitar vectores de ataque XSS.
            return response()->json([
                'message' => 'Inicio de sesión exitoso',
            ], 200);

        }

        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     summary="Cerrar sesión",
     *     tags={"Auth"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Cierre de sesión exitoso"
     *     )
     * )
     */
    public function logout(Request $request){
        $user = $request->user();

        // 1. Guardar auditoría de cierre ANTES de destruir la sesión
        CierreSesion::create([
            'direccion_ip' => $request->ip(),
            'fecha_hora_cierre' => now(),
            'usuario_id' => $user->id,
        ]);

        // 2. Revocar token de API solo si existe (compatibilidad con Mobile/Bearer)
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        // 3. Cierre de sesión de Web/SPA (Sanctum)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Cierre de sesión exitoso'], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/global-logout",
     *     summary="Cerrar sesión global",
     *     tags={"Auth"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Cierre de sesión global exitoso"
     *     )
     * )
     */
    public function globalLogout(Request $request){
        $user = $request->user();

        // 1. Guardar auditoría de cierre
        CierreSesion::create([
            'direccion_ip' => $request->ip(),
            'fecha_hora_cierre' => now(),
            'usuario_id' => $user->id,
        ]);

        // 2. Revocar todos los tokens
        $user->tokens()->delete();

        // 3. Cierre de sesión web
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Cierre de sesión global exitoso'], 200);
    }

}
