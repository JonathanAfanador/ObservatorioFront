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
        Schema::table('empresas', function (Blueprint $table) {
            if (!Schema::hasColumn('empresas', 'razon_social')) {
                $table->string('razon_social')->nullable()->after('name');
            }
            if (!Schema::hasColumn('empresas', 'representante_legal')) {
                $table->string('representante_legal')->nullable()->after('razon_social');
            }
            if (!Schema::hasColumn('empresas', 'email')) {
                $table->string('email')->nullable()->after('representante_legal');
            }
            if (!Schema::hasColumn('empresas', 'telefono')) {
                $table->string('telefono')->nullable()->after('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            if (Schema::hasColumn('empresas', 'razon_social')) {
                $table->dropColumn('razon_social');
            }
            if (Schema::hasColumn('empresas', 'representante_legal')) {
                $table->dropColumn('representante_legal');
            }
            if (Schema::hasColumn('empresas', 'email')) {
                $table->dropColumn('email');
            }
            if (Schema::hasColumn('empresas', 'telefono')) {
                $table->dropColumn('telefono');
            }
        });
    }
};
