<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Car>
 */
class CarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'name' => ucfirst($name),
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . uniqid(),
            'brand' => $this->faker->randomElement(['Toyota', 'Honda', 'Hyundai', 'Ford', 'Kia', 'Mazda']),
            'model' => $this->faker->word,
            'year' => $this->faker->numberBetween(2015, 2024),
            'seats' => $this->faker->randomElement([4, 5, 7]),
            'transmission' => $this->faker->randomElement(['Tự động', 'Số sàn']),
            'fuel' => $this->faker->randomElement(['Xăng', 'Dầu', 'Điện']),
            'price_per_day' => $this->faker->numberBetween(500, 2000) * 1000,
            'status' => 'available',
            'description' => $this->faker->paragraphs(3, true),
        ];
    }
}
