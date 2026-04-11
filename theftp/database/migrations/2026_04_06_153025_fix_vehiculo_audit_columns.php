<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehiculo', function (Blueprint $table) {
            // Cambiamos estado de boolean a string y motivo_estado de string a text
            $table->string('estado')->default('Operativo')->change();
            $table->text('motivo_estado')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->boolean('estado')->default(true)->change();
            $table->string('motivo_estado')->nullable()->change();
        });
    }
};
