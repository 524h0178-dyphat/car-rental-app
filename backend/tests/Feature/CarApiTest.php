<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is required for database-backed API tests.');
        }

        parent::setUp();
    }

    public function test_cars_can_be_filtered_searched_sorted_and_paginated(): void
    {
        $hcm = Location::create(['name' => 'Quận 1', 'province' => 'TP. Hồ Chí Minh']);
        $hanoi = Location::create(['name' => 'Hoàn Kiếm', 'province' => 'Hà Nội']);

        Car::factory()->create([
            'location_id' => $hcm->id,
            'name' => 'Toyota Vios',
            'brand' => 'Toyota',
            'model' => 'Vios',
            'seats' => 5,
            'transmission' => 'Số tự động',
            'fuel' => 'Xăng',
            'price_per_day' => 700000,
            'status' => 'available',
        ]);

        Car::factory()->create([
            'location_id' => $hanoi->id,
            'name' => 'Ford Everest',
            'brand' => 'Ford',
            'model' => 'Everest',
            'seats' => 7,
            'transmission' => 'Số tự động',
            'fuel' => 'Dầu',
            'price_per_day' => 1200000,
            'status' => 'available',
        ]);

        Car::factory()->create([
            'location_id' => $hcm->id,
            'name' => 'Toyota bảo dưỡng',
            'brand' => 'Toyota',
            'model' => 'Camry',
            'status' => 'maintenance',
        ]);

        $response = $this->getJson('/api/v1/cars?' . http_build_query([
            'search' => 'toyota',
            'brand' => 'Toyota',
            'province' => 'TP. Hồ Chí Minh',
            'seats' => '5',
            'price_min' => 500000,
            'price_max' => 900000,
            'sort_by' => 'price_per_day',
            'sort_dir' => 'asc',
            'per_page' => 1,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.name', 'Toyota Vios');
    }

    public function test_cars_reject_invalid_query_parameters(): void
    {
        $this->getJson('/api/v1/cars?sort_by=bad_column&per_page=200')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sort_by', 'per_page']);
    }
}
