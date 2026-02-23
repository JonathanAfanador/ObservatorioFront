<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\permisos>
 */
class PermisosFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tabla' => $this->faker->word(),
            'create' => $this->faker->boolean(20),
            'read' => $this->faker->boolean(80),
            'update' => $this->faker->boolean(20),
            'delete' => $this->faker->boolean(10),
            'rol_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
