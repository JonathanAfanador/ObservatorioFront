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
        Schema::create('novedades_licencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('licencia_id');
            $table->string('tipo_novedad', 100);
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->text('observaciones')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // Archivo histórico de eliminados

            $table->foreign('licencia_id')
                  ->references('id')
                  ->on('licencias')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('novedades_licencias');
    }
};
