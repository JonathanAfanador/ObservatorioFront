<?php

$dir = dirname(__DIR__);
$appDir = $dir . '/app';
$dbDir = $dir . '/database';

$directories = [$appDir, $dbDir];

$models = [
    'barrios' => 'Barrio',
    'categorias_licencia' => 'CategoriaLicencia',
    'cierre_sesion' => 'CierreSesion',
    'conductores' => 'Conductor',
    'conductores_licencias' => 'ConductorLicencia',
    'departamentos' => 'Departamento',
    'documentos' => 'Documento',
    'empresas' => 'Empresa',
    'inicio_sesion' => 'InicioSesion',
    'licencias' => 'Licencia',
    'menus' => 'Menu',
    'municipios' => 'Municipio',
    'permisos' => 'Permiso',
    'personas' => 'Persona',
    'propietarios' => 'Propietario',
    'restriccion_lic' => 'RestriccionLicencia',
    'rol' => 'Rol',
    'roles_menus' => 'RolMenu',
    'rutas' => 'Ruta',
    'seguim_estado_veh' => 'SeguimientoEstadoVehiculo',
    'seguim_gps' => 'SeguimientoGps',
    'tipo_doc' => 'TipoDocumento',
    'tipo_empresa' => 'TipoEmpresa',
    'tipo_ident' => 'TipoIdentificacion',
    'tipo_vehiculo' => 'TipoVehiculo',
    'vehiculo' => 'Vehiculo',
];

$filesToProcess = [];

foreach ($directories as $directory) {
    if (!is_dir($directory)) continue;
    
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $filesToProcess[] = $file->getPathname();
        }
    }
}

$totalChanges = 0;

foreach ($filesToProcess as $file) {
    $content = file_get_contents($file);
    $originalContent = $content;

    foreach ($models as $old => $new) {
        $replacements = [
            "use App\\Models\\$old;" => "use App\\Models\\$new;",
            "new $old(" => "new $new(",
            "new $old;" => "new $new;",
            "$old::" => "$new::",
            "class $old extends" => "class $new extends",
            "$old::class" => "$new::class",
            "App\\Models\\$old" => "App\\Models\\$new",
            "($old $" => "($new $",
            ", $old $" => ", $new $",
            "@return $old" => "@return $new",
            "@property $old" => "@property $new"
        ];

        foreach ($replacements as $search => $replace) {
            $content = str_replace($search, $replace, $content);
        }
    }

    if ($content !== $originalContent) {
        echo preg_replace('/^.*ObservatorioFront\\\\theftp\\\\/', '', $file) . "\n";
        $totalChanges++;
    }
}

echo "Total files to modify: $totalChanges\n";
