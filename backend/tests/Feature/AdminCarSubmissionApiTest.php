<?php

namespace Tests\Feature;

use App\Models\CarSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCarSubmissionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is required for database-backed API tests.');
        }

        parent::setUp();
    }

    public function test_approving_submission_publishes_car_to_search(): void
    {
        $submission = CarSubmission::create([
            'owner_name' => 'Nguyen Van B',
            'owner_phone' => '0901234567',
            'owner_email' => 'owner@example.com',
            'owner_cccd' => '012345678901',
            'brand' => 'Honda',
            'model' => 'City',
            'year' => 2022,
            'license_plate' => '51A-12345',
            'transmission' => 'Sá»‘ tá»± Ä‘á»™ng',
            'fuel' => 'XÄƒng',
            'seats' => 5,
            'expected_price_per_day' => 650000,
            'location_province' => 'TP. Ho Chi Minh',
            'description' => 'Xe ky gui dang cho duyet',
        ]);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->patchJson("/api/v1/admin/car-submissions/{$submission->id}/status", [
            'status' => 'approved',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $submission->refresh();

        $this->assertNotNull($submission->car_id);
        $this->assertDatabaseHas('cars', [
            'id' => $submission->car_id,
            'brand' => 'Honda',
            'model' => 'City',
            'status' => 'available',
        ]);

        $this->getJson('/api/v1/cars?' . http_build_query([
            'search' => 'Honda',
        ]))
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $submission->car_id);
    }
}
