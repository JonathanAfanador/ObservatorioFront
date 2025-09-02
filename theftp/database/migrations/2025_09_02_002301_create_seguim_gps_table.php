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
        Schema::create('seguim_gps', function (Blueprint $table) {
            $table->id();
            $table->point('ubicacion')->nullable();
            $table->timestamp('fecha_hora')->nullable();
            $table->foreignId('vehiculo_id')->constrained('vehiculo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seguim_gps');
    }
};
