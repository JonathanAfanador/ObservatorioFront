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
        Schema::create('rutas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // TODO: Indagar uso de rutas, si es solo visualización se puede optar por solo retornar el .kml. Si no, investigar como guardar rutas en BD espacial (PostGIS)
            $table->text('file_name');
            $table->foreignId('empresa_id')->constrained('empresas');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutas');
    }
};
