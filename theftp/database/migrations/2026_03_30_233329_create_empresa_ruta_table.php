<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Crear tabla pivote para la relación Muchos a Muchos
        Schema::create('empresa_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('ruta_id')->constrained('rutas')->onDelete('cascade');
            $table->timestamps();
            
            // Asegurar que una empresa no tenga la misma ruta asignada dos veces
            $table->unique(['empresa_id', 'ruta_id']);
        });

        // Migrar datos existentes (1:1 a N:M) para evitar pérdida de datos en el entorno de desarrollo/producción
        if (Schema::hasColumn('rutas', 'empresa_id')) {
            \Illuminate\Support\Facades\DB::table('rutas')
                ->whereNotNull('empresa_id')
                ->orderBy('id')
                ->chunk(100, function ($rutas) {
                    $pivotData = [];
                    foreach ($rutas as $ruta) {
                        $pivotData[] = [
                            'empresa_id' => $ruta->empresa_id,
                            'ruta_id' => $ruta->id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                    \Illuminate\Support\Facades\DB::table('empresa_ruta')->insert($pivotData);
                });

            // 2. Opcional/Recomendado: Remover la columna empresa_id de rutas (ya que ahora es M:M)
            Schema::table('rutas', function (Blueprint $table) {
                // Si la Foreign Key existe, hay que tumbarla primero (el nombre default de Laravel suele ser rutas_empresa_id_foreign)
                $table->dropForeign(['empresa_id']);
                $table->dropColumn('empresa_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback: Restaurar empresa_id a rutas
        if (!Schema::hasColumn('rutas', 'empresa_id')) {
            Schema::table('rutas', function (Blueprint $table) {
                $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            });
        }

        Schema::dropIfExists('empresa_ruta');
    }
};
