<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

class GeovisorController extends BaseController
{
    /**
     * Vista principal del Geovisor.
     * Pasa al Blade la lista de archivos KMZ a cargar.
     * Añade o quita entradas de $kmzFiles para gestionar las capas.
     */
    public function index()
    {
        // ── Lista de archivos KMZ ─────────────────────────────────────────
        // Cada entrada: 'file' → nombre en public/maps/, 'label' → nombre legible
        $kmzDefinitions = [
            ['file' => 'rutas_paraderos.kmz',  'label' => 'Rutas y Paraderos'],
            ['file' => 'Paradero R5.kmz',       'label' => 'Paradero R5'],
            ['file' => 'Paradero R3a.kmz',      'label' => 'Paradero R3a'],
        ];

        // Filtra solo los que existen físicamente en public/maps/
        $kmzFiles = [];
        foreach ($kmzDefinitions as $def) {
            $path = public_path('maps/' . $def['file']);
            if (file_exists($path)) {
                $kmzFiles[] = [
                    'url'    => asset('maps/' . $def['file']),
                    'label'  => $def['label'],
                    'exists' => true,
                ];
            } else {
                // Los que no existen los incluimos igual para mostrar alerta
                $kmzFiles[] = [
                    'url'    => asset('maps/' . $def['file']),
                    'label'  => $def['label'],
                    'exists' => false,
                ];
            }
        }

        $missingFiles = array_filter($kmzFiles, fn($f) => !$f['exists']);

        return view('geovisor.geovisor_vite', [
            'kmzFiles'    => $kmzFiles,
            'missingFiles'=> array_values($missingFiles),
            'mapCenter'   => [
                'lat'  => 4.3042,
                'lng'  => -74.8014,
                'zoom' => 13,
            ],
        ]);
    }

    /**
     * Sirve un archivo KMZ con headers correctos.
     * Lista blanca: solo archivos registrados en $allowed.
     */
    public function serveKmz(string $filename)
    {
        $allowed = [
            'rutas_paraderos.kmz',
            'Paradero R5.kmz',
            'Paradero R3a.kmz',
        ];

        if (!in_array($filename, $allowed)) {
            return response()->json(['error' => 'Archivo no permitido.'], 404);
        }

        $path = public_path('maps/' . $filename);

        if (!file_exists($path)) {
            return response()->json(['error' => 'Archivo no encontrado.'], 404);
        }

        return response()->file($path, [
            'Content-Type'        => 'application/vnd.google-earth.kmz',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control'       => 'public, max-age=86400',
        ]);
    }
}