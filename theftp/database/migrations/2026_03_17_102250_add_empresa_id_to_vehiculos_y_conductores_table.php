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
        // 1. Agregar a la tabla de vehículos
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
        });

        // 2. Agregar a la tabla de conductores
        Schema::table('conductores', function (Blueprint $table) {
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->dropForeign(['empresa_id']);
            $table->dropColumn('empresa_id');
        });

        Schema::table('conductores', function (Blueprint $table) {
            $table->dropForeign(['empresa_id']);
            $table->dropColumn('empresa_id');
        });
    }
};
