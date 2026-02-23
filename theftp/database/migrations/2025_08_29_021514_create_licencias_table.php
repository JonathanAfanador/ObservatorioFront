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
        if (!Schema::hasTable('licencias')) {
        Schema::create('licencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restriccion_lic_id')->constrained('restriccion_lic');
            $table->foreignId('categoria_lic_id')->constrained('categorias_licencia');
            $table->foreignId('documento_id')->constrained('documentos');
            $table->timestamps();
            $table->softDeletes();
        });

    }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licencias');
    }
};
