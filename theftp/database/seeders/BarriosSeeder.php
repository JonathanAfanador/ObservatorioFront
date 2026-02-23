<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarriosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $array = [
            ['name' => 'ACACIAS'],
            ['name' => 'CENTRO'],
            ['name' => 'GRANADA'],
            ['name' => 'MAGDALENA'],
            ['name' => 'MIRAFLORES'],
            ['name' => 'SAN MIGUEL'],
            ['name' => 'SAN ANTONIO'],
            ['name' => 'SANTANDER'],
            ['name' => 'SUCRE'],
            ['name' => 'ALTO DE LA CRUZ'],
            ['name' => 'ALTO DEL ROSARIO'],
            ['name' => 'ALTO DE LAS ROSAS'],
            ['name' => 'BOCAS DEL BOGOTÁ'],
            ['name' => 'DIEZ DE MAYO'],
            ['name' => 'DIVINO NIÑO'],
            ['name' => 'EL PORVENIR'],
            ['name' => 'PARQUES BOCAS BOGOTÁ'],
            ['name' => 'PUERTO CABRERA'],
            ['name' => 'PUERTO MONGUI'],
            ['name' => 'PUERTO MONTERO'],
            ['name' => 'SANTA MONICA'],
            ['name' => 'VEINTE DE JULIO'],
            ['name' => 'VILLA DEL RIO'],
            ['name' => 'ARRAYANES'],
            ['name' => 'BUENOS AIRES'],
            ['name' => 'CAMBULOS I - II'],
            ['name' => 'CAMBULOS III ETAPA'],
            ['name' => 'CENTENARIO'],
            ['name' => 'ESPERANZA'],
            ['name' => 'ESPERANZA VI ETAPA'],
            ['name' => 'ESTACION'],
            ['name' => 'GAITAN'],
            ['name' => 'GOLGOTA'],
            ['name' => 'HACIENDA GIRARDOT I'],
            ['name' => 'HACIENDA GIRARDOT II'],
            ['name' => 'LA COLINA'],
            ['name' => 'MENESES'],
            ['name' => 'NUESTRA SEÑORA DEL CARMEN'],
            ['name' => 'POZO AZUL'],
            ['name' => 'QUINTAS SAAVEDRA GALINDO'],
            ['name' => 'QUINTO PATIO'],
            ['name' => 'SANTA ELENA'],
            ['name' => 'SANTA ISABEL'],
            ['name' => 'VILLA ALEXANDER'],
            ['name' => 'VILLA CAROLINA'],
            ['name' => 'VILLA CECILIA'],
            ['name' => 'VILLAMPIS'],
            ['name' => 'VIVISOL'],
            ['name' => 'ALGARROBOS III'],
            ['name' => 'ALGARROBOS IV ETAPA'],
            ['name' => 'ALTOS DEL PEÑÓN'],
            ['name' => 'CIUDAD MONTES'],
            ['name' => 'CORAZON DE CUNDINAMARCA'],
            ['name' => 'DIAMANTE CENTRAL'],
            ['name' => 'DIAMANTE NOR ORIENTAL'],
            ['name' => 'DIAMANTE V ETAPA'],
            ['name' => 'ESMERALDA I SECTOR'],
            ['name' => 'ESMERALDA II ETAPA'],
            ['name' => 'ESMERALDA III ETAPA'],
            ['name' => 'ESPERANZA NORTE'],
            ['name' => 'JUAN PABLO II'],
            ['name' => 'LA ZULIA'],
            ['name' => 'LOS NARANJOS'],
            ['name' => 'RAMON BUENO'],
            ['name' => 'ROSABLANCA I SECTOR'],
            ['name' => 'ROSABLANCA II SECTOR'],
            ['name' => 'SAN FERNANDO'],
            ['name' => 'SANTA RITA'],
            ['name' => 'SOLARIS'],
            ['name' => 'TALISMAN'],
            ['name' => 'URBANIZACION EL COROZO'],
            ['name' => 'VALLE DEL SOL'],
            ['name' => 'BRISAS DEL BOGOTÁ'],
            ['name' => 'CEDRO VILLA OLARTE'],
            ['name' => 'KENNEDY I SECTOR'],
            ['name' => 'KENNEDY II SECTOR'],
            ['name' => 'KENNEDY III SECTOR'],
            ['name' => 'KENNEDY IV SECTOR'],
            ['name' => 'LA CAROLINA'],
            ['name' => 'LA VICTORIA'],
            ['name' => 'MAGDALENA III'],
            ['name' => 'OBRERO'],
            ['name' => 'PORTACHUELO'],
            ['name' => 'PRIMERO DE ENERO'],
            ['name' => 'SALSIPUEDES'],
            ['name' => 'SAN JORGE'],
            ['name' => 'SANTA FE'],
            ['name' => 'TRIUNFO'],
            ['name' => 'VILLA KENNEDY'],
            ['name' => 'BARZALOSA CENTRO'],
            ['name' => 'BARZALOZA SECTOR CEMENTERIO'],
            ['name' => 'BERLIN'],
            ['name' => 'GUABINAL CERRO'],
            ['name' => 'GUABINAL PLAN'],
            ['name' => 'LOS PRADOS I SECTOR'],
            ['name' => 'LOS PRADOS II SECTOR'],
            ['name' => 'LUIS CARLOS GALÁN'],
            ['name' => 'PIAMONTE'],
            ['name' => 'PRESIDENTE'],
            ['name' => 'ACAPULCO (ZUMBAMICOS)'],
            ['name' => 'AGUA BLANCA'],
            ['name' => 'POTRERILLO'],
            ['name' => 'SAN LORENZO'],
            ['name' => 'J.V.C. ACACIAS II'],
            ['name' => 'J.V.C. DIAMANTE POPULAR'],
            ['name' => 'J.V.C. LA MILAGROSA'],
            ['name' => 'J.V.C. SAN RAFAEL'],
            ['name' => 'SIMON BOLIVAR'],
        ];

        //Buscar el ID real del municipio GIRARDOT
        $municipioId = DB::table('municipios')->where('codigo_dane', '25307')->value('id');
        // Si no se encuentra por codigo_dane, intentar por nombre (mayúsculas)
        if (!$municipioId) {
            $municipioId = DB::table('municipios')->whereRaw('UPPER(name) = ?', ['GIRARDOT'])->value('id');
        }
        // Si aún no se encuentra, lanzar error
        if (!$municipioId) {
            throw new \RuntimeException('No se encontró el municipio GIRARDOT en la tabla municipios.');
        }

        //Añadir municipios_id a cada registro
        $barrios = array_map(function ($b) use ($municipioId) {
            return $b + ['municipios_id' => $municipioId];
        }, $array);

        DB::table('barrios')->insert($barrios);
    }
}
