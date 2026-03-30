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
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->boolean('estado')->default(true)->after('es_propio');
            $table->string('motivo_estado')->nullable()->after('estado');
            $table->date('fecha_vencimiento_soat')->nullable()->after('motivo_estado');
            $table->date('fecha_vencimiento_tecno')->nullable()->after('fecha_vencimiento_soat');
        });

        Schema::table('conductores', function (Blueprint $table) {
            $table->boolean('estado')->default(true)->after('user_id');
            $table->string('motivo_estado')->nullable()->after('estado');
        });

        Schema::table('licencias', function (Blueprint $table) {
            $table->string('motivo_estado')->nullable()->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->dropColumn(['estado', 'motivo_estado', 'fecha_vencimiento_soat', 'fecha_vencimiento_tecno']);
        });

        Schema::table('conductores', function (Blueprint $table) {
            $table->dropColumn(['estado', 'motivo_estado']);
        });

        Schema::table('licencias', function (Blueprint $table) {
            $table->dropColumn(['motivo_estado']);
        });
    }
};
