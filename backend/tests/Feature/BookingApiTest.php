<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is required for database-backed API tests.');
        }

        parent::setUp();
    }

    private function createCar(array $overrides = []): Car
    {
        $location = Location::create(['name' => 'Quận 1', 'province' => 'TP. Hồ Chí Minh']);

        return Car::factory()->create(array_merge([
            'location_id' => $location->id,
            'price_per_day' => 800000,
            'status' => 'available',
        ], $overrides));
    }

    private function bookingPayload(Car $car, array $overrides = []): array
    {
        return array_merge([
            'car_id' => $car->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'renter_name' => 'Nguyễn Văn A',
            'renter_phone' => '0901234567',
            'renter_cccd' => '012345678901',
            'payment_method' => 'bank_transfer',
        ], $overrides);
    }

    public function test_user_can_create_booking_and_overlap_is_rejected(): void
    {
        $user = User::factory()->create();
        $car = $this->createCar();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/bookings', $this->bookingPayload($car))
            ->assertCreated()
            ->assertJsonPath('data.total_days', 2)
            ->assertJsonPath('data.total_price', 1600000);

        $this->postJson('/api/v1/bookings', $this->bookingPayload($car, [
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
        ]))->assertUnprocessable();
    }

    public function test_back_to_back_booking_is_allowed(): void
    {
        $user = User::factory()->create();
        $car = $this->createCar();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/bookings', $this->bookingPayload($car))
            ->assertCreated();

        $this->postJson('/api/v1/bookings', $this->bookingPayload($car, [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
        ]))->assertCreated();
    }

    public function test_user_cannot_cancel_another_users_booking_or_completed_booking(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $car = $this->createCar();

        $booking = Booking::create([
            'user_id' => $owner->id,
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
            'status' => 'completed',
        ]);

        Sanctum::actingAs($other);
        $this->postJson("/api/v1/bookings/{$booking->id}/cancel")
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->postJson("/api/v1/bookings/{$booking->id}/cancel")
            ->assertUnprocessable();
    }
}
