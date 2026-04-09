<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Programación de Backups Diarios
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:native')->daily()->at('02:00')->onSuccess(function () {
    \Log::info("Backup diario nativo ejecutado con éxito.");
})->onFailure(function () {
    \Log::error("Fallo la ejecución del backup diario nativo.");
});

Schedule::command('backup:clean')->daily()->at('04:30');
