<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ruta;

// Simular la petición que hace el frontend
$ruta = Ruta::with('paraderos')->find(2);
echo "ID: " . $ruta->id . "\n";
echo "Nombre: " . $ruta->name . "\n";
echo "Total paraderos en relación: " . count($ruta->paraderos) . "\n";

foreach($ruta->paraderos as $index => $p) {
    if ($index < 5 || $index > 30) {
        echo "Paradero $index: Lat: {$p->lat}, Lng: {$p->lng}\n";
    }
}
