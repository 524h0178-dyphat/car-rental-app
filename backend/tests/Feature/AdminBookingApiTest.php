<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBookingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is required for database-backed API tests.');
        }

        parent::setUp();
    }

    private function createBooking(string $status = 'pending'): Booking
    {
        $location = Location::create(['name' => 'Quận 1', 'province' => 'TP. Hồ Chí Minh']);
        $car = Car::factory()->create(['location_id' => $location->id]);
        $user = User::factory()->create();

        return Booking::create([
            'user_id' => $user->id,
            'car_id' => $car->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'total_days' => 1,
            'price_per_day' => 800000,
            'total_price' => 800000,
            'renter_name' => 'Nguyễn Văn A',
            'renter_phone' => '0901234567',
            'renter_cccd' => '012345678901',
            'payment_method' => 'cash',
            'payment_status' => 'pending',
            'status' => $status,
        ]);
    }

    public function test_admin_middleware_blocks_customer(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));

        $this->getJson('/api/v1/admin/stats')
            ->assertForbidden();
    }

    public function test_admin_can_apply_valid_status_transition(): void
    {
        $booking = $this->createBooking('pending');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->patchJson("/api/v1/admin/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');
    }

    public function test_confirming_booking_marks_car_as_rented_and_hides_it_from_search(): void
    {
        $booking = $this->createBooking('pending');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->patchJson("/api/v1/admin/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ])->assertOk();

        $this->assertDatabaseHas('cars', [
            'id' => $booking->car_id,
            'status' => 'rented',
        ]);

        $this->getJson('/api/v1/cars?' . http_build_query([
            'search' => $booking->car->brand,
        ]))
            ->assertOk()
            ->assertJsonPath('meta.total', 0);
    }

    public function test_finishing_booking_releases_car_to_search(): void
    {
        $booking = $this->createBooking('active');
        $booking->car()->update(['status' => 'rented']);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->patchJson("/api/v1/admin/bookings/{$booking->id}/status", [
            'status' => 'completed',
        ])->assertOk();

        $this->assertDatabaseHas('cars', [
            'id' => $booking->car_id,
            'status' => 'available',
        ]);

        $this->getJson('/api/v1/cars?' . http_build_query([
            'search' => $booking->car->brand,
        ]))
            ->assertOk()
            ->assertJsonPath('meta.total', 1);
    }

    public function test_admin_cannot_apply_invalid_status_transition(): void
    {
        $booking = $this->createBooking('completed');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->patchJson("/api/v1/admin/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ])->assertUnprocessable();
    }
}
