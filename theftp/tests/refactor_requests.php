<?php
$controllersDir = __DIR__ . '/../app/Http/Controllers';
$controllerBase = $controllersDir . '/Controller.php';

// 1. Modificar Controller.php
$baseContent = file_get_contents($controllerBase);
$baseContent = preg_replace('/public function store\(Request \$request\)/', 'public function baseStore(Request $request)', $baseContent);
$baseContent = preg_replace('/public function update\(string \$id, Request \$request\)/', 'public function baseUpdate(string $id, Request $request)', $baseContent);
file_put_contents($controllerBase, $baseContent);
echo "Controller.php modificado (baseStore, baseUpdate)\n";

// 2. Modificar Controladores Hijos
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($controllersDir));
$processed = 0;

foreach ($files as $file) {
    if ($file->getExtension() !== 'php' || $file->getBasename() === 'Controller.php' || strpos($file->getPathname(), 'V1') !== false) {
        continue;
    }

    $content = file_get_contents($file->getPathname());
    $originalContent = $content;

    // Buscar app()->make para StoreRequest
    if (preg_match('/app\(\)->make\(([^:]+)::class\);/', $content, $matches)) {
        // Encontrar todos los app()->make
        preg_match_all('/app\(\)->make\(([^:]+)::class\);/', $content, $allMatches);
        
        $requestsToImport = [];
        
        foreach ($allMatches[1] as $requestClassRaw) {
            // El raw podría ser '\App\Http\Requests\StoreRutasRequest' o 'StoreUserRequest'
            $fullRequestClassOriginal = trim($requestClassRaw);
            $requestClass = substr(strrchr($fullRequestClassOriginal, "\\"), 1) ?: $fullRequestClassOriginal;
            
            $fullRequestClass = trim($fullRequestClassOriginal, "\\");
            
            if (strpos($fullRequestClass, 'App\Http\Requests\\') === false) {
                $fullRequestClass = "App\\Http\\Requests\\" . $fullRequestClass;
            }
            $requestsToImport[] = $fullRequestClass;

            if (strpos($requestClass, 'Store') === 0) {
                // Modificar firma store
                $content = preg_replace('/public function store\(Request \$request\)/', "public function store({$requestClass} \$request)", $content);
                // Eliminar app()->make
                $content = preg_replace('/[ \t]*app\(\)->make\(.*' . preg_quote($requestClass) . '::class\);\n?/', '', $content);
            } elseif (strpos($requestClass, 'Update') === 0) {
                // Modificar firma edit o update
                $content = preg_replace('/public function (edit|update)\(string \$id, Request \$request\)/', "public function $1(string \$id, {$requestClass} \$request)", $content);
                // Eliminar app()->make
                $content = preg_replace('/[ \t]*app\(\)->make\(.*' . preg_quote($requestClass) . '::class\);\n?/', '', $content);
            }
        }

        // Modificar llamadas a parent::
        $content = str_replace('parent::store($request)', 'parent::baseStore($request)', $content);
        $content = str_replace('parent::update($id, $request)', 'parent::baseUpdate($id, $request)', $content);

        // Añadir imports de Requests si no existen
        $requestsToImport = array_unique($requestsToImport);
        $importBlock = "";
        foreach ($requestsToImport as $req) {
            if (strpos($content, "use {$req};") === false) {
                $importBlock .= "use {$req};\n";
            }
        }
        
        if (!empty($importBlock)) {
            // Insertar después del namespace o los primeros uses
            $content = preg_replace('/(namespace [^;]+;)/', "$1\n\n" . trim($importBlock), $content, 1);
        }

        if ($content !== $originalContent) {
            file_put_contents($file->getPathname(), $content);
            echo "Modificado: {$file->getBasename()}\n";
            $processed++;
        }
    }
}

echo "\nTotal de controladores modificados: $processed\n";
