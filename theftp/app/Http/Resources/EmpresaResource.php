<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmpresaResource extends JsonResource
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
            'nit' => $this->nit,
            'name' => $this->name, // Clave para el dashboard JS
            'nombre' => $this->name, // Alias por si acaso
            'direccion' => $this->direccion,
            'telefono' => $this->telefono,
            'email' => $this->email,
            'representante_legal' => $this->representante_legal,
            'tipo_empresa_id' => $this->tipo_empresa_id,
            
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->format('Y-m-d H:i:s') : null,
            
            'tipo_empresa' => $this->whenLoaded('tipo_empresa')
        ];
    }
}
