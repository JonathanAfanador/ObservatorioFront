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
            // TODO: Misma pregunta https://trello.com/c/zbWGJOYp/4-indagar-por-la-tabla-rutas-si-es-solo-renderizado-o-tiene-otros-usos-relevantes-planteados
            // $table->geography('ubicacion', subtype: 'point', srid: 4326)->nullable();
            $table->float('latitud')->nullable();
            $table->float('longitud')->nullable();
            $table->timestamp('fecha_hora')->nullable();
            $table->boolean('deleted_at')->default(false);
            $table->foreignId('vehiculo_id')->constrained('vehiculo');
            $table->timestamps();
        });
        // DB::statement('CREATE INDEX idx_ubicacion ON seguim_gps USING GIST (ubicacion);');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seguim_gps');
    }
};
