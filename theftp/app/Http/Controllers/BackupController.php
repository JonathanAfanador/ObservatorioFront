<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use Carbon\Carbon;

class BackupController extends Controller
{
    /**
     * Constructor vacío para evitar inyección del modelo base definido en Controller.
     */
    public function __construct()
    {
        // No llamamos al constructor padre
    }

    /**
     * Lista los backups disponibles en el disco configurado (Google Drive).
     */
    public function index()
    {
        try {
            $diskName = config('backup.backup.destination.disks')[0] ?? 'google';
            $disk = Storage::disk($diskName);
            $adapter = $disk->getAdapter();
            
            // Usamos el listado de archivos del disco. 
            // Si la carpeta (eg. "Laravel") aún no ha sido creada por un primer backup, Flysystem lanza un error. Lo atrapamos e inicializamos en vacío.
            try {
                $files = $disk->allFiles(config('backup.backup.name'));
            } catch (\Exception $e) {
                $files = [];
            }
            
            $backups = [];
            foreach ($files as $file) {
                if (str_ends_with($file, '.zip')) {
                    $backups[] = [
                        'file_path' => $file,
                        'file_name' => basename($file),
                        'file_size' => $this->formatBytes($disk->size($file)),
                        'last_modified' => Carbon::createFromTimestamp($disk->lastModified($file))->toDateTimeString(),
                        'download_url' => route('backups.download', ['file' => base64_encode($file)]),
                    ];
                }
            }

            // Ordenar de más reciente a más antiguo
            usort($backups, function ($a, $b) {
                return $b['last_modified'] <=> $a['last_modified'];
            });

            return response()->json([
                'success' => true,
                'data' => $backups,
                'disk' => $diskName
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar backups: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispara la creación de un nuevo backup manualmente.
     */
    public function create()
    {
        try {
            // Ejecutamos el mismo comando Artisan que corre en el programador de tareas
            \Illuminate\Support\Facades\Artisan::call('backup:native');
            $output = \Illuminate\Support\Facades\Artisan::output();

            if (strpos($output, 'exitosamente') !== false) {
                return response()->json([
                    'success' => true,
                    'message' => '¡Respaldo subido con éxito a Google Drive!',
                    'output' => trim($output)
                ]);
            } else {
                throw new \Exception("Error en el comando:\n" . trim($output));
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descarga un archivo de backup específico desde Google Drive.
     */
    public function download($fileBase64)
    {
        try {
            $file = base64_decode($fileBase64);
            $diskName = config('backup.backup.destination.disks')[0] ?? 'google';
            $disk = Storage::disk($diskName);

            if (!$disk->exists($file)) {
                abort(404, 'El archivo no existe en el almacenamiento.');
            }

            return $disk->download($file);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar el archivo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un backup antiguo.
     */
    public function destroy($fileBase64)
    {
        try {
            $file = base64_decode($fileBase64);
            $diskName = config('backup.backup.destination.disks')[0] ?? 'google';
            $disk = Storage::disk($diskName);

            if ($disk->exists($file)) {
                $disk->delete($file);
                return response()->json(['success' => true, 'message' => 'Backup eliminado.']);
            }

            return response()->json(['success' => false, 'message' => 'El archivo no existe.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper para formatear bytes.
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
