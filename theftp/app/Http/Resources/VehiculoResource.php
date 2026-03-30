<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
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
            'placa' => $this->placa,
            'marca' => $this->marca,
            'modelo' => $this->modelo,
            'color' => $this->color,
            'tipo_veh_id' => $this->tipo_veh_id,
            'propietario_id' => $this->propietario_id,
            'servicio' => $this->servicio,
            'empresa_id' => $this->empresa_id,
            'estado' => $this->estado,
            'motivo_estado' => $this->motivo_estado,

            // Fechas de documentación
            'fecha_matricula' => $this->fecha_matricula,
            'fecha_expedicion_soat' => $this->fecha_expedicion_soat,
            'fecha_vencimiento_soat' => $this->fecha_vencimiento_soat,
            'fecha_expedicion_tecno' => $this->fecha_expedicion_tecno,
            'fecha_vencimiento_tecno' => $this->fecha_vencimiento_tecno,
            'documento_soat_id' => $this->documento_soat_id,
            'documento_tecno_id' => $this->documento_tecno_id,
            
            // Fechas de auditoría
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->format('Y-m-d H:i:s') : null,
            
            // Relaciones incluidas condicionalmente
            'tipo' => $this->whenLoaded('tipo'),
            'propietario' => $this->whenLoaded('propietario'),
            'empresa' => $this->whenLoaded('empresa'),
            'documentoSoat' => $this->whenLoaded('documentoSoat'),
            'documentoTecno' => $this->whenLoaded('documentoTecno'),
        ];
    }
}
