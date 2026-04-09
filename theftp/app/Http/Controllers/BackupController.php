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
            $dbName = env('DB_DATABASE');
            $password = env('DB_PASSWORD');
            $date = \Carbon\Carbon::now()->format('Y-m-d-H-i-s');
            
            // Buscar pg_dump activamente ignorando el PATH en caché
            $pgDumpPathsToTry = [
                'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe',
                'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe',
                env('PG_DUMP_PATH', '') !== '' ? rtrim(env('PG_DUMP_PATH', ''), '/\\') . DIRECTORY_SEPARATOR . 'pg_dump.exe' : '',
                'pg_dump.exe'
            ];
            
            $finalPgDumpPath = 'pg_dump.exe';
            foreach ($pgDumpPathsToTry as $path) {
                if ($path !== '' && (file_exists($path) || $path === 'pg_dump.exe')) {
                    $finalPgDumpPath = $path;
                    if (file_exists($path)) break;
                }
            }
            
            $storageFolder = storage_path('app/backup-manual-nativo');
            if (!is_dir($storageFolder)) {
                @mkdir($storageFolder, 0755, true);
            }
            
            $sqlFile = $storageFolder . '/database_' . $date . '.sql';
            $zipFile = $storageFolder . '/backup-' . $date . '.zip';
            $googleFolder = config('backup.backup.name', 'Laravel');
            $googleDestPath = $googleFolder . '/backup-' . $date . '.zip';

            // 1. Extraer BD nativamente ignorando Spatie y sus bugs de PGPASSFILE en Windows
            $command = 'set PGPASSWORD=' . $password . ' && "' . $finalPgDumpPath . '" -h 127.0.0.1 -p 5433 -U postgres -F p -f "' . $sqlFile . '" ' . $dbName . ' 2>&1';
            $output = shell_exec($command);
            
            if (!file_exists($sqlFile) || filesize($sqlFile) === 0 || strpos((string)$output, 'error:') !== false || strpos((string)$output, 'FATAL') !== false) {
                throw new \Exception("Error al dumpear la base de datos desde PostgreSQL:\n" . $output);
            }

            // 2. Comprimir el SQL dentro de un archivo ZIP de forma nativa en PHP
            $zip = new \ZipArchive();
            if ($zip->open($zipFile, \ZipArchive::CREATE) !== true) {
                throw new \Exception("No se pudo crear el archivo ZIP temporal en: " . $zipFile);
            }
            $zip->addFile($sqlFile, 'db-dumps/postgresql-' . $dbName . '.sql');
            $zip->close();

            // 3. Subir el ZIP directamente hacia Google Drive
            $diskName = config('backup.backup.destination.disks')[0] ?? 'google';
            $disk = \Illuminate\Support\Facades\Storage::disk($diskName);
            
            if (!$disk->put($googleDestPath, file_get_contents($zipFile))) {
                throw new \Exception("Ocurrió un error subiendo el ZIP a Google Drive. Revisa tu token y conexión a internet.");
            }

            // 4. Limpieza final de los temporales locales
            @unlink($sqlFile);
            @unlink($zipFile);

            return response()->json([
                'success' => true,
                'message' => '¡Respaldo subido con éxito a Google Drive!',
                'output' => 'Backup manual nativo ejecutado y transferido exitosamente.'
            ]);
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
