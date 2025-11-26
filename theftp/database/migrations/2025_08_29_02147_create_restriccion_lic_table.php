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
        if (!Schema::hasTable('restriccion_lic')) {
        Schema::create('restriccion_lic', function (Blueprint $table) {
            $table->id();
            $table->string('descripcion', 150);
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
        Schema::dropIfExists('restriccion_lic');
    }
};
