<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            // 'password' omitido intencionalmente
            'rol_id' => $this->rol_id,
            'persona_id' => $this->persona_id,
            'unable' => $this->unable,
            'unable_date' => $this->unable_date,
            'email_verified_at' => $this->email_verified_at,
            
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->format('Y-m-d H:i:s') : null,
            
            'persona' => new PersonaResource($this->whenLoaded('personas')), // En User.php la relación se llama 'personas', aunque deberia ser persona
            'rol' => $this->whenLoaded('rol'),
            'empresa' => $this->whenLoaded('empresa'),
        ];
    }
}
