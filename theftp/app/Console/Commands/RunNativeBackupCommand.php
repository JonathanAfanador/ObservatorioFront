<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use ZipArchive;
use Exception;

class RunNativeBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:native';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ejecuta un volcado nativo de la base de datos PostgreSQL y lo sube a Google Drive';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando backup nativo de PostgreSQL...');

        try {
            $dbHost = config('database.connections.pgsql.host');
            $dbPort = config('database.connections.pgsql.port');
            $dbUser = config('database.connections.pgsql.username');
            $dbName = config('database.connections.pgsql.database');
            $password = config('database.connections.pgsql.password');
            $date = Carbon::now()->format('Y-m-d-H-i-s');
            
            // Buscar pg_dump activamente
            $finalPgDumpPath = 'pg_dump';

            
            $storageFolder = storage_path('app/backup-manual-nativo');
            if (!is_dir($storageFolder)) {
                @mkdir($storageFolder, 0755, true);
            }
            
            $sqlFile = $storageFolder . '/database_' . $date . '.sql';
            $zipFile = $storageFolder . '/backup-' . $date . '.zip';
            $googleFolder = config('backup.backup.name', 'Laravel');
            $googleDestPath = $googleFolder . '/backup-' . $date . '.zip';

            $command = "PGPASSWORD={$password} {$finalPgDumpPath} -h {$dbHost} -p {$dbPort} -U {$dbUser} -F p -f \"{$sqlFile}\" {$dbName} 2>&1";

            
            if (!file_exists($sqlFile) || filesize($sqlFile) === 0 || strpos((string)$output, 'error:') !== false || strpos((string)$output, 'FATAL') !== false) {
                throw new Exception("Error al dumpear la base de datos:\n" . $output);
            }

            $this->line("- Comprimiendo a formato ZIP...");

            // 2. Comprimir el SQL dentro de un archivo ZIP
            $zip = new ZipArchive();
            if ($zip->open($zipFile, ZipArchive::CREATE) !== true) {
                throw new Exception("No se pudo crear el archivo ZIP temporal en: " . $zipFile);
            }
            $zip->addFile($sqlFile, 'db-dumps/postgresql-' . $dbName . '.sql');
            $zip->close();

            $this->line("- Subiendo a Google Drive...");

            // 3. Subir el ZIP directamente hacia Google Drive
            $diskName = config('backup.backup.destination.disks')[0] ?? 'google';
            $disk = Storage::disk($diskName);
            
            if (!$disk->put($googleDestPath, file_get_contents($zipFile))) {
                throw new Exception("Ocurrió un error subiendo el ZIP a Google Drive.");
            }

            // 4. Limpieza final de los temporales locales
            @unlink($sqlFile);
            @unlink($zipFile);

            $this->info("¡Backup generado y transferido exitosamente!");
            return Command::SUCCESS;

        } catch (Exception $e) {
            $this->error('Fallo el proceso de backup: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
