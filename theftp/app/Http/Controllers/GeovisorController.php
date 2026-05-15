<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class GeovisorController extends BaseController
{
    /**
     * Vista principal del Geovisor.
     */
    public function index()
    {
        $mapCenter = [
            'lat'  => 4.3042,
            'lng'  => -74.8014,
            'zoom' => 14,
        ];

        return view('geovisor.geovisor_vite', [
            'mapCenter' => $mapCenter
        ]);
    }

    /**
     * Vista del Geovisor para la app móvil.
     * Devuelve SOLO el mapa, sin navbar, footer ni elementos de la web.
     * Detectado por el header X-App-Client: ObservatorioMovil
     */
    public function mobile()
    {
        $mapCenter = [
            'lat'  => 4.3042,
            'lng'  => -74.8014,
            'zoom' => 14,
        ];

        return view('geovisor.geovisor_mobile', [
            'mapCenter' => $mapCenter
        ]);
    }

    /**
     * Sirve un archivo KMZ con headers correctos.
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

    /**
     * Proxy para OSRM: el servidor Laravel solicita la ruta a OSRM
     * y la devuelve al frontend, eliminando problemas de CORS.
     * Las rutas se cachean por 1 hora para reducir peticiones externas.
     */
    public function proxyOsrmRoute(Request $request)
    {
        $request->validate([
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_lat'   => 'required|numeric',
            'to_lng'   => 'required|numeric',
        ]);

        $fromLat = round($request->from_lat, 5);
        $fromLng = round($request->from_lng, 5);
        $toLat   = round($request->to_lat, 5);
        $toLng   = round($request->to_lng, 5);

        $cacheKey = "route_{$fromLat}_{$fromLng}_{$toLat}_{$toLng}";

        $result = Cache::remember($cacheKey, 3600, function () use ($fromLat, $fromLng, $toLat, $toLng) {
            
            // --- BLOQUE DE FUNCIÓN AUXILIAR PARA PETICIONES ---
            $fetchGeometries = function($withAlternatives = true) use ($fromLat, $fromLng, $toLat, $toLng) {
                $geoms = [];
                
                // 1. Intentar Valhalla (Peatonal)
                try {
                    $body = [
                        'locations' => [['lat' => $fromLat, 'lon' => $fromLng], ['lat' => $toLat, 'lon' => $toLng]],
                        'costing' => 'pedestrian',
                        'alternatives' => $withAlternatives ? 1 : 0,
                        'shape_format' => 'polyline6',
                        'directions_options' => ['units' => 'km'],
                    ];
                    $res = Http::timeout($withAlternatives ? 6 : 4)->post('https://valhalla1.openstreetmap.de/route', $body);
                    
                    if ($res->successful()) {
                        $data = $res->json();
                        $legs = $data['trip']['legs'] ?? [];
                        if (!empty($legs)) {
                            $geoms[] = $this->decodePolyline($legs[0]['shape'], 1e-6);
                            if ($withAlternatives && isset($data['alternatives'])) {
                                foreach ($data['alternatives'] as $alt) {
                                    $altLegs = $alt['trip']['legs'] ?? [];
                                    if (!empty($altLegs)) $geoms[] = $this->decodePolyline($altLegs[0]['shape'], 1e-6);
                                }
                            }
                            return ['status' => true, 'geometries' => $geoms, 'engine' => 'valhalla'];
                        }
                    }
                } catch (\Exception $e) {}

                // 2. Intentar OSRM Foot (Solo si Valhalla falló)
                $altParam = $withAlternatives ? "&alternatives=true" : "";
                $osrmUrl = "https://routing.openstreetmap.de/routed-foot/route/v1/foot/{$fromLng},{$fromLat};{$toLng},{$toLat}?overview=full&geometries=geojson" . $altParam;
                try {
                    $res = Http::timeout($withAlternatives ? 6 : 4)->get($osrmUrl);
                    if ($res->successful()) {
                        $data = $res->json();
                        if (($data['code'] ?? '') === 'Ok' && !empty($data['routes'])) {
                            foreach ($data['routes'] as $r) {
                                $coords = $r['geometry']['coordinates'];
                                $geoms[] = array_map(fn($c) => [$c[1], $c[0]], $coords);
                            }
                            return ['status' => true, 'geometries' => $geoms, 'engine' => 'osrm-foot'];
                        }
                    }
                } catch (\Exception $e) {}

                return null;
            };

            // --- LÓGICA DE ROBUSTEZ ---
            // Intento 1: Con alternativas (6s timeout)
            $res = $fetchGeometries(true);
            if ($res) return $res;

            // Intento 2 (Fallback): Sin alternativas (Más rápido, para asegurar que no haya línea recta)
            $resSimple = $fetchGeometries(false);
            if ($resSimple) return $resSimple;

            return ['status' => false, 'message' => 'No se pudo obtener la ruta peatonal tras reintentos.'];
        });

        return response()->json($result);
    }

    /**
     * Decodifica una cadena Google Polyline (precision variable).
     * Valhalla usa precision 1e-6.
     */
    private function decodePolyline(string $str, float $precision = 1e-5): array
    {
        $index = 0;
        $lat   = 0;
        $lng   = 0;
        $len   = strlen($str);
        $latlngs = [];

        while ($index < $len) {
            // Decodificar latitud
            $b = $shift = $result = 0;
            do {
                $b = ord($str[$index++]) - 63;
                $result |= ($b & 0x1f) << $shift;
                $shift += 5;
            } while ($b >= 0x20);
            $lat += ($result & 1) ? (~$result >> 1) : ($result >> 1);

            // Decodificar longitud
            $b = $shift = $result = 0;
            do {
                $b = ord($str[$index++]) - 63;
                $result |= ($b & 0x1f) << $shift;
                $shift += 5;
            } while ($b >= 0x20);
            $lng += ($result & 1) ? (~$result >> 1) : ($result >> 1);

            $latlngs[] = [$lat * $precision, $lng * $precision];
        }

        return $latlngs;
    }
}