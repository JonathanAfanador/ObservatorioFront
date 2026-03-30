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
        Schema::table('licencias', function (Blueprint $table) {
            $table->string('numero')->nullable()->after('id');
            $table->date('fecha_expedicion')->nullable()->after('documento_id');
            $table->date('fecha_vencimiento')->nullable()->after('fecha_expedicion');
            $table->string('organismo_transito')->nullable()->after('fecha_vencimiento');
            $table->string('estado')->default('vigente')->after('organismo_transito');
            $table->boolean('verificado_secretaria')->default(false)->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('licencias', function (Blueprint $table) {
            $table->dropColumn([
                'numero',
                'fecha_expedicion',
                'fecha_vencimiento',
                'organismo_transito',
                'estado',
                'verificado_secretaria'
            ]);
        });
    }
};
