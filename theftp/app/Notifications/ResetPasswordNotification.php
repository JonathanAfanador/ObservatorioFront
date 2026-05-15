<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * El código numérico de 6 dígitos para restablecer la contraseña.
     */
    public string $code;

    public function __construct(string $code)
    {
        $this->code = $code;
    }

    /**
     * Canales de entrega de la notificación.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Representación en email de la notificación.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Código de recuperación — Observatorio de Transporte')
            ->greeting('Hola, ' . $notifiable->name . '.')
            ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta en el **Observatorio de Transporte Público de Girardot**.')
            ->line('Tu código de verificación es:')
            ->line('## ' . $this->code)
            ->line('Ingresa este código en la pantalla de recuperación. **El código es válido por 60 minutos.**')
            ->line('Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje. Tu cuenta está segura.')
            ->salutation('Secretaría de Tránsito y Transporte — Alcaldía de Girardot');
    }
}
