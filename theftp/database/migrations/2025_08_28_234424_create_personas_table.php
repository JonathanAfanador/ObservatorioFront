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
        Schema::create('personas', function (Blueprint $table) {
            $table->id();
            $table->string('nui');
            $table->string('name');
            $table->string('last_name');
            $table->string('phone_number');
            $table->enum('gender', ['Mujer', 'Hombre']);
            $table->foreignId('tipo_ident_id')->constrained('tipo_ident');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};
