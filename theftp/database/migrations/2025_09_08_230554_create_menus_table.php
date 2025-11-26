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
        if (!Schema::hasTable('menus')) {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->text('icon')->nullable();
            $table->text('url')->nullable();
            $table->foreignId('padre_id')->nullable()->constrained('menus');
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
        Schema::dropIfExists('menus');
    }
};
