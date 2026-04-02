<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$paraderos = App\Models\Paradero::where('ruta_id', 2)->get();
echo 'Total Paraderos Ruta 2: ' . count($paraderos) . "\n";
$first5 = $paraderos->take(5);
foreach ($first5 as $p) {
    echo "ID: {$p->id} | Nombre: {$p->name} | Lat: {$p->lat} | Lng: {$p->lng}\n";
}
