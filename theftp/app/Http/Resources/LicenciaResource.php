<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LicenciaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'fecha_expedicion' => $this->fecha_expedicion,
            'fecha_vencimiento' => $this->fecha_vencimiento,
            'organismo_transito' => $this->organismo_transito,
            'estado' => $this->estado,
            'motivo_estado' => $this->motivo_estado,
            'verificado_secretaria' => (bool)$this->verificado_secretaria,
            
            // Relaciones
            'categoria' => $this->whenLoaded('categoria'),
            'restriccion' => $this->whenLoaded('restriccion'),
            'documento' => $this->whenLoaded('documento'),
        ];
    }
}
