<?php

namespace App\Services;

use ZipArchive;
use App\Models\Ruta;
use App\Models\Paradero;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class KmzParserService
{
    /**
     * Sincroniza los paraderos de una Ruta decodificando su archivo geo-espacial cargado (KML/KMZ).
     *
     * @param Ruta $ruta
     * @return array Resumen del procesamiento [status, paraderos_creados, errores]
     */
    public function syncParaderosFromRouteFile(Ruta $ruta): array
    {
        if (!$ruta->file_name) {
            return ['status' => 'error', 'message' => 'La ruta no tiene archivo físico asigando.'];
        }

        // Determinar path real físico en el servidor web
        $cleanedPath = str_replace('/storage/', '', $ruta->file_name);
        $absoluteFilePath = storage_path('app/private/' . $cleanedPath);
        
        if (!file_exists($absoluteFilePath)) {
            // Reintento en formato de carpeta general (Por si subió manual)
            $absoluteFilePath = storage_path('app/' . ltrim($ruta->file_name, '/'));
            if (!file_exists($absoluteFilePath)) {
                return ['status' => 'error', 'message' => 'Archivo no encontrado en el almacenamiento: ' . $absoluteFilePath];
            }
        }

        try {
            // Leer y decodificar el XML bruto
            $kmlContent = $this->extractKmlString($absoluteFilePath);
            if (!$kmlContent) {
                return ['status' => 'error', 'message' => 'Imposible decodificar la estructura interna XML (KML inválido)'];
            }

            // Parsear XML
            $points = $this->parseKmlPoints($kmlContent);

            if (empty($points)) {
                return ['status' => 'warning', 'message' => 'No se encontraron coordenadas <Point> en el archivo. Esto no es un archivo de paraderos.'];
            }

            // ¡Destruir paraderos viejos para evitar duplicación fantasma al re-sincronizar!
            Paradero::where('ruta_id', $ruta->id)->delete();

            // Insertar masivamente desde PHP hacia el motor SQL
            $created = 0;
            foreach ($points as $punto) {
                // $punto  -> ['name' => ..., 'lng' => ..., 'lat' => ...]
                Paradero::create([
                    'ruta_id'     => $ruta->id,
                    'name'        => $punto['name'],
                    'description' => $punto['desc'],
                    'lng'         => $punto['lng'],
                    'lat'         => $punto['lat'],
                    'estado'      => true
                ]);
                $created++;
            }

            return ['status' => 'success', 'paraderos_creados' => $created, 'message' => "Se sembraron {$created} paraderos automáticamente en SQL."];

        } catch (\Exception $e) {
            Log::error("[KmzParser] Sincronización fallida de paraderos ruta ID {$ruta->id}: " . $e->getMessage());
            return ['status' => 'error', 'message' => 'Excepción fatal al decodificar: ' . $e->getMessage()];
        }
    }

    /**
     * Descomprime el KMZ (ZIP) o lee el KML directamente.
     */
    private function extractKmlString(string $filePath): ?string
    {
        $bytes = file_get_contents($filePath, false, null, 0, 4);
        
        // Magia hexadecimal de los ZIP (PK..)
        $isZip = (strpos($bytes, "PK\x03\x04") === 0);

        if ($isZip) {
            $zip = new ZipArchive;
            if ($zip->open($filePath) === TRUE) {
                for($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    // Solo escaneamos archivos raiz o internos con extensión .kml
                    if (str_ends_with(strtolower($filename), '.kml')) {
                         $kmlText = $zip->getFromIndex($i);
                         $zip->close();
                         return $kmlText;
                    }
                }
                $zip->close();
            }
            return null; // Archivo ZIP sin KML visible
        }

        // Si no es zip, asumimos texto plano directamente
        return file_get_contents($filePath);
    }

    /**
     * Intercepta la estructura de Google Earth KML (Placemarks) para ubicar los Points.
     */
    private function parseKmlPoints(string $xmlString): array
    {
        // Suppress warnings in case of bad XML
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlString);
        if ($xml === false) {
            return []; // Falla en parseo
        }

        // Registrar namespaces de Google (usualmente <kml xmlns="http://www.opengis.net/kml/2.2">)
        $namespaces = $xml->getNamespaces(true);
        $kmlNs = isset($namespaces['']) ? $namespaces[''] : 'http://www.opengis.net/kml/2.2';
        $xml->registerXPathNamespace('kml', $kmlNs);

        // Búsqueda XPath universal por cualquier nodo Placemark que contenga un geometry Point
        $placemarks = $xml->xpath('//kml:Placemark[kml:Point]');
        
        // Fallback por si el KML no usó namespace
        if (empty($placemarks)) {
            $placemarks = $xml->xpath('//Placemark[Point]');
        }

        $points = [];

        foreach ($placemarks as $placemark) {
            // El KML namespace puede molestar al leer nodos hijos directos si no se invoca children()
            $name = isset($placemark->name) ? (string) $placemark->name : 'Paradero Sin Nombre';
            $desc = isset($placemark->description) ? (string) $placemark->description : '';

            // Intentar cazar coordenadas ("lng,lat,alt") de <Point><coordinates>
            $coordinatesStr = null;
            if (isset($placemark->Point->coordinates)) {
                $coordinatesStr = (string)$placemark->Point->coordinates;
            } else {
                // Explorar namespace KML para Point/coordinates
                $pointNode = $placemark->children($kmlNs)->Point;
                if ($pointNode && isset($pointNode->coordinates)) {
                    $coordinatesStr = (string)$pointNode->coordinates;
                }
            }

            if ($coordinatesStr) {
                $parts = explode(',', trim($coordinatesStr));
                if (count($parts) >= 2) {
                    $lng = (float) trim($parts[0]);
                    $lat = (float) trim($parts[1]);

                    $points[] = [
                        'name' => trim($name),
                        'desc' => strip_tags(trim($desc)), // Quitamos basura HTML que Google Earth mete ahí
                        'lat'  => $lat,
                        'lng'  => $lng
                    ];
                }
            }
        }

        return $points;
    }
}
