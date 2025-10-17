<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class DatabaseBackupCommand extends Command
{
    /**
     * El nombre y la firma del comando de consola.
     *
     * @var string
     */
    protected $signature = 'db:backup';

    /**
     * La descripción del comando de consola.
     *
     * @var string
     */
    protected $description = 'Realiza un backup local de la base de datos PostgreSQL.';

    /**
     * Ejecuta el comando de consola.
     *
     * @return int
     */
    public function handle()
    {
        // 1. Verificar que el driver sea PostgreSQL
        if (config('database.default') !== 'pgsql') {
            $this->error('Este comando solo es compatible con la conexión de base de datos PostgreSQL.');
            return Command::FAILURE;
        }

        // 2. Definir el directorio de backups
        $backupDir = storage_path('app/backups/pgsql');
        if (!File::isDirectory($backupDir)) {
            File::makeDirectory($backupDir, 0777, true, true);
        }

        // 3. Obtener credenciales de la base de datos
        $databaseConfig = config('database.connections.pgsql');
        $dbHost = $databaseConfig['host'];
        $dbPort = $databaseConfig['port'];
        $dbUser = $databaseConfig['username'];
        $dbPass = $databaseConfig['password'];
        $dbName = $databaseConfig['database'];

        // 4. Crear el nombre del archivo de backup con la zona horaria de Bogotá
        // Usamos Carbon para manejar la zona horaria
        $now = now()->setTimezone('America/Bogota');
        $fileName = $now->format('Y-m-d_H-i-s') . '_backup.sql';
        $filePath = $backupDir . '/' . $fileName;

        $this->info("Iniciando backup de '$dbName' en: $filePath");

        // 5. Construir el comando pg_dump
        // Se utilizan variables de entorno (PG* y PGPASSWORD) para pasar las credenciales de forma segura
        // y se dirige la salida al archivo.
        $command = "pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName > $filePath";

        // 6. Configurar el proceso con la variable PGPASSWORD
        $process = Process::fromShellCommandline($command, null, [
            'PGPASSWORD' => $dbPass,
        ]);

        // 7. Ejecutar el proceso
        $process->run();

        // 8. Verificar el resultado
        if (!$process->isSuccessful()) {
            $this->error("¡Fallo en el backup!");
            $this->error($process->getErrorOutput());
            // Intenta eliminar el archivo incompleto si existe
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
            return Command::FAILURE;
        }

        $this->info("🎉 ¡Backup creado exitosamente! Ubicación: $filePath");
        return Command::SUCCESS;
    }
}
