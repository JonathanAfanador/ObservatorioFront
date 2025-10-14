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
        Schema::create('vehiculo', function (Blueprint $table) {
            $table->id();
            $table->string('color');
            $table->string('marca');
            $table->string('placa');
            $table->string('modelo');
            $table->boolean('servicio')->default(false);
            $table->boolean('deleted_at')->default(false);
            $table->foreignId('propietario_id')->constrained('propietarios');
            $table->foreignId('tipo_veh_id')->constrained('tipo_vehiculo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehiculo');
    }
};
