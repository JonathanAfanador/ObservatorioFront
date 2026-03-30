<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vehiculo;
use Laravel\Sanctum\Sanctum;

class VehiculosTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $tipoVeh;
    protected $empresa;
    protected $persona;
    protected $propietario;

    protected function setUp(): void
    {
        parent::setUp();
        
        \Illuminate\Support\Facades\DB::table('tipo_ident')->insert(['id' => 1, 'descripcion' => 'CC']);
        \Illuminate\Support\Facades\DB::table('rol')->insert(['id' => 1, 'descripcion' => 'Administrador']);
        
        \Illuminate\Support\Facades\DB::table('permisos')->insert([
            'rol_id' => 1,
            'tabla' => 'vehiculo',
            'create' => true,
            'read' => true,
            'update' => true,
            'delete' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \Illuminate\Support\Facades\DB::table('tipo_empresa')->insert(['id' => 1, 'descripcion' => 'Pública']);
        \Illuminate\Support\Facades\DB::table('empresas')->insert(['id' => 1, 'name' => 'Empresa Test', 'nit' => '12345', 'tipo_empresa_id' => 1]);
        \Illuminate\Support\Facades\DB::table('tipo_vehiculo')->insert(['id' => 1, 'descripcion' => 'Carro']);
        
        $this->empresa = 1;
        $this->tipoVeh = 1;
        $tipoIdent = 1;
        $rol = 1;
        
        $this->persona = new \App\Models\Persona();
        $this->persona->nui = 'admin_nui_1';
        $this->persona->name = 'Admin Name';
        $this->persona->last_name = 'Admin Last Name';
        $this->persona->phone_number = '3000000000';
        $this->persona->gender = 'Hombre';
        $this->persona->tipo_ident_id = $tipoIdent;
        $this->persona->save();
        
        $tipoDoc = \Illuminate\Support\Facades\DB::table('tipo_doc')->insertGetId(['descripcion' => 'PDF']);
        $documento = \Illuminate\Support\Facades\DB::table('documentos')->insertGetId([
            'url' => 'test/url.pdf',
            'observaciones' => 'Doc Test',
            'tipo_doc_id' => $tipoDoc,
            'created_at' => now(),
        ]);
        
        $this->propietario = \Illuminate\Support\Facades\DB::table('propietarios')->insertGetId([
            'fecha_registro' => now(),
            'persona_id' => $this->persona->id,
            'documento_id' => $documento,
        ]);

        $this->user = new User();
        $this->user->name = 'Admin';
        $this->user->email = 'admin@vehiculostest.com';
        $this->user->password = bcrypt('123456');
        $this->user->rol_id = $rol;
        $this->user->empresa_id = $this->empresa;
        $this->user->persona_id = $this->persona->id;
        $this->user->save();
    }

    public function test_can_list_vehiculos()
    {
        Sanctum::actingAs($this->user);
        
        Vehiculo::create([
            'placa' => 'ABC1234',
            'marca' => 'Toyota',
            'color' => 'Rojo',
            'modelo' => '2020',
            'tipo_veh_id' => $this->tipoVeh,
            'propietario_id' => $this->propietario,
            'empresa_id' => $this->empresa,
        ]);

        $response = $this->getJson('/api/vehiculos');

        $response->assertStatus(200)
                 ->assertJsonStructure(['status', 'data', 'total']);
    }

    public function test_can_create_vehiculo()
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'placa' => 'XYZ789',
            'marca' => 'Mazda',
            'color' => 'Gris',
            'modelo' => '2022',
            'tipo_veh_id' => $this->tipoVeh,
            'propietario_id' => $this->propietario,
            'empresa_id' => $this->empresa,
        ];

        // El FormRequest nativo Validará estos campos
        $response = $this->postJson('/api/vehiculos', $payload);
        $response->assertStatus(201);
        $this->assertDatabaseHas('vehiculo', ['placa' => 'XYZ789']);
    }
    
    public function test_validation_fails_on_empty_vehiculo()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/vehiculos', []);
        // El FormRequest inyectado nativamente debe interceptar y devolver 422
        $response->assertStatus(422)
                 ->assertJsonStructure(['errors' => ['placa', 'marca', 'color', 'modelo']]);
    }
}
