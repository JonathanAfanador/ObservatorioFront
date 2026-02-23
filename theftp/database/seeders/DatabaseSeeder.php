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
            EmpresaSeeder::class,
            UserSeeder::class,
            PropietariosSeeder::class,
            TipoVehiculoSeeder::class,
            RestriccionLicSeeder::class,
            CategoriasLicenciaSeeder::class,
            RutasSeeder::class,
            VehiculoSeeder::class,
            ConductoresSeeder::class,
            LicenciasSeeder::class,
            PermisosSeeder::class,
            MenusSeeder::class,
            RolesMenusSeeder::class,
            ConductoresLicenciasSeeder::class,
            SeguimEstadoVehSeeder::class,
            SeguimGpsSeeder::class,
        ]);

    }
}
