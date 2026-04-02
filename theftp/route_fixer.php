<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ruta;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

$origen = public_path('maps/Ruta3a.kmz');
$destino = storage_path('app/private/rutas/Ruta_3a.kmz');

if(File::exists($origen)) {
    File::copy($origen, $destino);
    Ruta::where('id', 2)->update(['file_name' => '/storage/rutas/Ruta_3a.kmz']);
    echo "Ruta 2 actualizada para apuntar al trazado Ruta3a.kmz.\n";
} else {
    echo "No se encontró el archivo origen: $origen\n";
}
