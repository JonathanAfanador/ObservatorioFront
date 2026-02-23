<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('propietarios', function (Blueprint $table) {
            // Agregamos ->nullable() para que no falle con datos existentes
            $table->foreignId('persona_id')
                ->nullable() // <--- AGREGA ESTO
                ->after('id')
                ->constrained('personas')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('propietarios', function (Blueprint $table) {
            $table->dropForeign(['persona_id']);
            $table->dropColumn('persona_id');
        });
    }
};