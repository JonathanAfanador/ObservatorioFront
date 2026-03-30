<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Índice único PARCIAL: solo aplica a filas activas (deleted_at IS NULL).
     *
     * Ventajas frente a un UNIQUE INDEX normal:
     *  - Los conductores soft-deleted no bloquean futuros registros de la misma persona.
     *  - Los duplicados existentes con deleted_at != NULL no generan conflicto al crear el índice.
     *  - Compatible con el comportamiento de SoftDeletes de Laravel.
     */
    public function up(): void
    {
        DB::statement('
            CREATE UNIQUE INDEX conductores_persona_id_unique
            ON conductores (persona_id)
            WHERE deleted_at IS NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS conductores_persona_id_unique');
    }
};
