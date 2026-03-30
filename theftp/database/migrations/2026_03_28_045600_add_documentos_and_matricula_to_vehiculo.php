<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->date('fecha_matricula')->nullable()->after('fecha_vencimiento_tecno');
            $table->date('fecha_expedicion_soat')->nullable()->after('fecha_matricula');
            $table->date('fecha_expedicion_tecno')->nullable()->after('fecha_expedicion_soat');
            $table->foreignId('documento_soat_id')->nullable()->constrained('documentos')->after('fecha_expedicion_tecno');
            $table->foreignId('documento_tecno_id')->nullable()->constrained('documentos')->after('documento_soat_id');
        });
    }

    public function down(): void
    {
        Schema::table('vehiculo', function (Blueprint $table) {
            $table->dropForeign(['documento_soat_id']);
            $table->dropForeign(['documento_tecno_id']);
            $table->dropColumn([
                'fecha_matricula',
                'fecha_expedicion_soat',
                'fecha_expedicion_tecno',
                'documento_soat_id',
                'documento_tecno_id',
            ]);
        });
    }
};
