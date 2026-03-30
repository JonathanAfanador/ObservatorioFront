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
        Schema::table('seguim_estado_veh', function (Blueprint $table) {
            $table->foreignId('conductor_id')->nullable()->after('ruta_id')->constrained('conductores')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seguim_estado_veh', function (Blueprint $table) {
            $table->dropForeign(['conductor_id']);
            $table->dropColumn('conductor_id');
        });
    }
};
