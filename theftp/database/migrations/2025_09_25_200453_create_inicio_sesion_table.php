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
        Schema::create('inicio_sesion', function (Blueprint $table) {
            $table->id();
            $table->string('direccion_ip')->nullable();
            $table->timestamp('fecha_hora_inicio')->useCurrent();
            $table->timestamp('fecha_ultima_actividad')->nullable();
            $table->boolean('deleted_at')->default(false);
            $table->foreignId('usuario_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inicio_sesion');
    }
};
