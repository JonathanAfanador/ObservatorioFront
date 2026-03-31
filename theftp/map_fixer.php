<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ruta;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

$destinoPrivate = storage_path('app/private/rutas');
if (!File::exists($destinoPrivate)) {
    File::makeDirectory($destinoPrivate, 0755, true);
}

$origen = public_path('maps');
$fileR3a = $origen . '/Paradero R3a.kmz';
$fileR5 = $origen . '/Paradero R5.kmz';

if(File::exists($fileR3a)) {
    File::copy($fileR3a, $destinoPrivate . '/Paradero_R3a.kmz');
    Ruta::where('id', 2)->update(['file_name' => '/storage/rutas/Paradero_R3a.kmz']);
    echo "Ruta 2 actualizada.\n";
} else {
    echo "R3a no existe\n";
}

if(File::exists($fileR5)) {
    File::copy($fileR5, $destinoPrivate . '/Paradero_R5.kmz');
    Ruta::where('id', 3)->update(['file_name' => '/storage/rutas/Paradero_R5.kmz']);
    echo "Ruta 3 actualizada.\n";
} else {
    echo "R5 no existe\n";
}
echo "Terminado\n";
