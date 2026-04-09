<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Programación de Backups Diarios
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:run')->daily()->at('04:00')->onSuccess(function () {
    \Log::info("Backup diario ejecutado con éxito.");
})->onFailure(function () {
    \Log::error("Fallo la ejecución del backup diario.");
});

Schedule::command('backup:clean')->daily()->at('04:30');
