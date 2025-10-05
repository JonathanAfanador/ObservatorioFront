<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seguim_gps', function (Blueprint $table) {
            $table->id();
            $table->geography('ubicacion', subtype: 'point', srid: 4326)->nullable();
            $table->timestamp('fecha_hora')->nullable();
            $table->foreignId('vehiculo_id')->constrained('vehiculo');
            $table->timestamps();
        });
        DB::statement('CREATE INDEX idx_ubicacion ON seguim_gps USING GIST (ubicacion);');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seguim_gps');
    }
};
