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
    Schema::table('documentos', function (Blueprint $table) {
        // Agregamos la columna empresa_id, que puede ser nula (nullable)
        // para documentos generales que no pertenecen a una empresa específica.
        $table->foreignId('empresa_id')
              ->nullable()
              ->after('tipo_doc_id') // (Opcional) Para orden visual
              ->constrained('empresas'); // Crea la llave foránea automáticamente
    });
}

public function down(): void
{
    Schema::table('documentos', function (Blueprint $table) {
        // Eliminamos la llave foránea y la columna si revertimos
        $table->dropForeign(['empresa_id']);
        $table->dropColumn('empresa_id');
    });
}
};
