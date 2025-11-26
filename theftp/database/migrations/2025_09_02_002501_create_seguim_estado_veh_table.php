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
        if (!Schema::hasTable('seguim_estado_veh')) {
        Schema::create('seguim_estado_veh', function (Blueprint $table) {
            $table->id();
            $table->integer('kilometraje')->nullable();
            $table->timestamp('fecha_hora')->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('usuario_id')->constrained('users');
            $table->foreignId('vehiculo_id')->constrained('vehiculo');
            $table->foreignId('ruta_id')->constrained('rutas');
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
        Schema::dropIfExists('seguim_estado_veh');
    }
};
