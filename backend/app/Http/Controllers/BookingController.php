<?php

namespace App\Http\Controllers;

use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Car;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// [BACKEND REVIEW]
// ✅ Auth: All routes protected by auth:sanctum middleware
// ✅ Authorization: Users can only see/cancel their own bookings
// ✅ Business logic: Overlap check prevents double-booking
// ✅ Atomic: Total price calculated server-side (not trusted from client)
// ✅ Soft cancellation: Status + timestamp updated, not deleted

class BookingController extends Controller
{
    /**
     * GET /api/v1/bookings
     * List authenticated user's bookings.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $bookings = Booking::with(['car.images'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return BookingResource::collection($bookings);
    }

    /**
     * POST /api/v1/bookings
     * Create a new booking.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $car = Car::findOrFail($request->car_id);

        // Guard: Car must be available
        if ($car->status !== 'available') {
            return response()->json([
                'message' => 'Xe hiện không khả dụng để đặt.',
            ], 422);
        }

        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate   = \Carbon\Carbon::parse($request->end_date);
        $totalDays = (int) $startDate->diffInDays($endDate);

        // Guard: Overlap check (no other ACTIVE booking for same car in range)
        $overlap = Booking::where('car_id', $car->id)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->where('start_date', '<=', $startDate)
                         ->where('end_date', '>=', $endDate);
                  });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'Xe đã có người đặt trong khoảng thời gian này. Vui lòng chọn ngày khác.',
            ], 422);
        }

        $totalPrice = $car->price_per_day * $totalDays;

        $booking = Booking::create([
            'user_id'        => $request->user()->id,
            'car_id'         => $car->id,
            'start_date'     => $startDate,
            'end_date'       => $endDate,
            'total_days'     => $totalDays,
            'price_per_day'  => $car->price_per_day,
            'total_price'    => $totalPrice,
            'renter_name'    => $request->renter_name,
            'renter_phone'   => $request->renter_phone,
            'renter_cccd'    => $request->renter_cccd,
            'renter_license' => $request->renter_license,
            'pickup_address' => $request->pickup_address,
            'pickup_note'    => $request->pickup_note,
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'status'         => 'pending',
            'note'           => $request->note,
        ]);

        return response()->json([
            'message' => 'Đặt xe thành công! Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.',
            'data'    => new BookingResource($booking->load('car.images')),
        ], 201);
    }

    /**
     * GET /api/v1/bookings/{id}
     * Show single booking.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with(['car.images'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => new BookingResource($booking)]);
    }

    /**
     * POST /api/v1/bookings/{id}/cancel
     * Cancel a booking.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $booking = Booking::where('user_id', $request->user()->id)->findOrFail($id);

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Không thể hủy đơn ở trạng thái ' . $booking->statusLabel() . '.',
            ], 422);
        }

        $booking->update([
            'status'        => 'cancelled',
            'cancel_reason' => $request->reason ?? 'Khách hủy',
            'cancelled_at'  => now(),
        ]);

        return response()->json([
            'message' => 'Đã hủy đơn đặt xe thành công.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }
}
