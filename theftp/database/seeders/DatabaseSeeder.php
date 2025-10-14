<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void{

        $this->call([
            DepartamentosSeeder::class,
            MunicipiosSeeder::class,
            BarriosSeeder::class,
            TipoDocSeeder::class,
            TipoEmpresaSeeder::class,
            TipoIndentSeeder::class,
            DocumentosSeeder::class,
            RolesSeeder::class,
            PersonasSeeder::class,
            UserSeeder::class,
            EmpresaSeeder::class,
            EmpresaUsuarioSeeder::class,
            PropietariosSeeder::class,
            // PermisosSeeder::class, // TODO: Revisar al finalizar el backend
        ]);

    }
}
