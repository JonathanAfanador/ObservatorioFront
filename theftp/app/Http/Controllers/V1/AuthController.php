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
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

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

            $isMobile = $request->hasHeader('X-App-Client');
            $plataforma = $isMobile ? 'Móvil' : 'Web';

            // --- CORRECCIÓN AUDITORÍA: InicioSesion se registra SOLO tras login exitoso ---
            InicioSesion::create([
                'direccion_ip' => $request->ip(),
                'fecha_hora_inicio' => now(),
                'fecha_ultima_actividad' => now(),
                'usuario_id' => $usuario->id,
                'plataforma' => $plataforma,
            ]);

            // --- SOPORTE MÓVIL ---
            // Si la petición viene de la app móvil, devolver token Bearer (Sanctum API Token)
            // Las apps móviles no pueden manejar cookies HttpOnly como los navegadores web
            $isMobile = $request->hasHeader('X-App-Client');
            if ($isMobile) {
                // Revocar tokens anteriores de la misma app para no acumularlos
                $usuario->tokens()->where('name', 'mobile')->delete();
                $token = $usuario->createToken('mobile')->plainTextToken;

                return response()->json([
                    'message' => 'Inicio de sesión exitoso',
                    'token'   => $token,
                    'user'    => $usuario->load(['persona', 'rol']),
                ], 200);
            }

            // Sanctum SPA: la sesión se establece automáticamente via cookie HttpOnly.
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
        // Bearer token (móvil) tiene prioridad; sesión web como fallback
        $user = $request->user() ?? Auth::guard('web')->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $isMobile   = $request->hasHeader('X-App-Client');
        $plataforma = $isMobile ? 'Móvil' : 'Web';

        // 1. Guardar auditoría ANTES de destruir la sesión
        // Owen-IT Auditing ahora resuelve el usuario via guard 'sanctum' (config/audit.php)
        CierreSesion::create([
            'direccion_ip'      => $request->ip(),
            'fecha_hora_cierre' => now(),
            'usuario_id'        => $user->id,
            'plataforma'        => $plataforma,
        ]);

        // 2. Revocar token Bearer si existe (Móvil)
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        // 3. Cierre de sesión SPA/Web
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
        $user = $request->user() ?? Auth::guard('web')->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $isMobile   = $request->hasHeader('X-App-Client');
        $plataforma = $isMobile ? 'Móvil' : 'Web';

        // 1. Guardar auditoría
        CierreSesion::create([
            'direccion_ip'      => $request->ip(),
            'fecha_hora_cierre' => now(),
            'usuario_id'        => $user->id,
            'plataforma'        => $plataforma,
        ]);

        // 2. Revocar todos los tokens
        $user->tokens()->delete();

        // 3. Cierre de sesión web
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Cierre de sesión global exitoso'], 200);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  RECUPERACIÓN DE CONTRASEÑA
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/auth/forgot-password",
     *     summary="Solicitar código de recuperación de contraseña",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@ejemplo.com")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Código enviado al correo"),
     *     @OA\Response(response=422, description="Email no encontrado o throttle activo")
     * )
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $usuario = User::where('email', $request->email)
            ->whereNull('deleted_at')
            ->where('unable', false)
            ->first();

        // Respuesta explícita si el correo no existe (para mejor UX, según solicitud)
        if (!$usuario) {
            return response()->json([
                'message' => 'No encontramos ninguna cuenta asociada a este correo electrónico.',
            ], 404);
        }

        // Throttle: verificar que no haya un token reciente (< 60s)
        $existing = DB::table('password_reset_tokens')
            ->where('email', $usuario->email)
            ->first();

        if ($existing) {
            $createdAt = \Carbon\Carbon::parse($existing->created_at);
            $throttle  = config('auth.passwords.users.throttle', 60);
            if ($createdAt->diffInSeconds(now()) < $throttle) {
                return response()->json([
                    'message' => 'Por favor espera ' . $throttle . ' segundos antes de solicitar otro código.',
                ], 429);
            }
        }

        // Generar código numérico de 6 dígitos
        $code = (string) random_int(100000, 999999);

        // Guardar (o actualizar) el token hasheado en la tabla
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $usuario->email],
            [
                'token'      => Hash::make($code),
                'created_at' => now(),
            ]
        );

        // Enviar notificación por email
        $usuario->notify(new ResetPasswordNotification($code));

        return response()->json([
            'message' => 'Si el correo existe en nuestro sistema, recibirás un código en breve.',
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/reset-password",
     *     summary="Restablecer contraseña con el código recibido",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "token", "password", "password_confirmation"},
     *             @OA\Property(property="email",                 type="string", format="email"),
     *             @OA\Property(property="token",                type="string", example="123456"),
     *             @OA\Property(property="password",             type="string", example="nuevaPass123"),
     *             @OA\Property(property="password_confirmation", type="string", example="nuevaPass123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Contraseña actualizada"),
     *     @OA\Response(response=400, description="Código inválido o expirado")
     * )
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => ['required', 'email'],
            'token'                 => ['required', 'string', 'size:6'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Código inválido o expirado.'], 400);
        }

        // Verificar expiración (60 minutos)
        $expireMinutes = config('auth.passwords.users.expire', 60);
        if (\Carbon\Carbon::parse($record->created_at)->addMinutes($expireMinutes)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'El código ha expirado. Solicita uno nuevo.'], 400);
        }

        // Verificar que el código coincide con el hash guardado
        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Código incorrecto. Verifica e intenta de nuevo.'], 400);
        }

        // Actualizar la contraseña del usuario
        $usuario = User::where('email', $request->email)
            ->whereNull('deleted_at')
            ->first();

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $usuario->password = Hash::make($request->password);
        $usuario->save();

        // Invalidar el token usado
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revocar todos los tokens Sanctum para forzar re-login (seguridad)
        $usuario->tokens()->delete();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
        ], 200);
    }

}
