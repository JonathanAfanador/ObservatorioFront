<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ruta;
use App\Services\KmzParserService;

class TestKmzParser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kmz:test {ruta_id? : El ID opcional de la ruta a testear. Por defecto es 2}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba el motor de extracción profunda PHP (ZIP+XML) para obtener Puntos de un archivo KMZ';

    /**
     * Execute the console command.
     */
    public function handle(KmzParserService $parser)
    {
        $id = $this->argument('ruta_id') ?? 2;
        $ruta = Ruta::find($id);

        if (!$ruta) {
            $this->error("La ruta con ID {$id} no existe.");
            return;
        }

        $this->info("Iniciando Extractor KMZ/KML en Ruta {$id}: {$ruta->nombre} ...");

        $resultado = $parser->syncParaderosFromRouteFile($ruta);

        if ($resultado['status'] === 'success') {
            $this->info("¡ÉXITO MATEMÁTICO!");
            $this->line($resultado['message']);
        } else {
            $this->error("¡FALLA!");
            $this->error($resultado['message'] ?? 'Hubo un error parsing el archivo.');
        }
    }
}
