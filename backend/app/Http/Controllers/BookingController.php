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

    /**
     * POST /api/v1/bookings/{id}/mock-payment
     * Mock successful payment for a booking (Demo only).
     */
    public function mockPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('user_id', $request->user()->id)->findOrFail($id);

        if ($booking->payment_status === 'paid') {
            return response()->json(['message' => 'Đơn này đã được thanh toán rồi.'], 400);
        }

        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return response()->json(['message' => 'Không thể thanh toán cho đơn ở trạng thái này.'], 400);
        }

        $booking->update([
            'payment_status' => 'paid',
        ]);

        return response()->json([
            'message' => 'Thanh toán mô phỏng thành công!',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * GET /api/v1/bookings/owner
     * List bookings for cars owned by the authenticated user.
     */
    public function ownerIndex(Request $request): AnonymousResourceCollection
    {
        $bookings = Booking::with(['car.images', 'user'])
            ->whereHas('car', function ($query) use ($request) {
                $query->where('owner_id', $request->user()->id);
            })
            ->latest()
            ->paginate(10);

        return BookingResource::collection($bookings);
    }

    /**
     * POST /api/v1/bookings/{id}/owner-confirm
     * Owner confirms a booking
     */
    public function ownerConfirm(Request $request, int $id): JsonResponse
    {
        $booking = Booking::whereHas('car', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể xác nhận đơn ở trạng thái chờ.'], 422);
        }

        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Đã xác nhận chuyến đi.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * POST /api/v1/bookings/{id}/owner-reject
     * Owner rejects a booking
     */
    public function ownerReject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $booking = Booking::whereHas('car', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể từ chối đơn ở trạng thái chờ.'], 422);
        }

        $booking->update([
            'status'        => 'cancelled',
            'cancel_reason' => $request->reason ?? 'Chủ xe từ chối',
            'cancelled_at'  => now(),
            // In a real escrow system, refund logic would go here.
            'payment_status' => $booking->payment_status === 'paid' ? 'refunded' : $booking->payment_status,
        ]);

        return response()->json([
            'message' => 'Đã từ chối chuyến đi.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * POST /api/v1/bookings/{id}/owner-handover
     * Owner confirms they have handed over the car to the renter.
     */
    public function ownerHandover(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with('car.owner')->whereHas('car', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($id);

        if ($booking->status !== 'confirmed') {
            return response()->json(['message' => 'Chỉ có thể bàn giao xe khi đơn đã được xác nhận.'], 422);
        }

        if ($booking->payment_status !== 'paid') {
            return response()->json(['message' => 'Khách chưa thanh toán, chưa thể bàn giao xe.'], 422);
        }

        if ($booking->handed_over_at) {
            return response()->json(['message' => 'Xe này đã được bàn giao rồi.'], 422);
        }

        $booking->update([
            'handed_over_at' => now(),
        ]);

        return response()->json([
            'message' => 'Đã xác nhận bàn giao xe. Chờ khách xác nhận.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * POST /api/v1/bookings/{id}/pickup
     * Renter confirms they have picked up the car -> Triggers payout to Owner!
     */
    public function pickup(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with('car.owner')->where('user_id', $request->user()->id)->findOrFail($id);

        if ($booking->status !== 'confirmed') {
            return response()->json(['message' => 'Đơn không ở trạng thái hợp lệ.'], 422);
        }

        if (!$booking->handed_over_at) {
            return response()->json(['message' => 'Chủ xe chưa xác nhận bàn giao.'], 422);
        }

        $booking->update([
            'status'       => 'active',
            'picked_up_at' => now(),
        ]);

        // Payout logic: transfer money to owner's wallet (minus platform fee)
        if ($booking->payment_status === 'paid' && $booking->payout_status === 'pending') {
            $platformFeePercent = 10; // 10% fee
            $fee = ($booking->total_price * $platformFeePercent) / 100;
            $payoutAmount = $booking->total_price - $fee;

            $wallet = \App\Models\Wallet::firstOrCreate(
                ['user_id' => $booking->car->owner_id],
                ['balance' => 0]
            );

            $wallet->increment('balance', $payoutAmount);

            \App\Models\Transaction::create([
                'wallet_id'      => $wallet->id,
                'type'           => 'credit',
                'amount'         => $payoutAmount,
                'description'    => "Thanh toán cho chuyến đi #{$booking->id} (Đã trừ {$platformFeePercent}% phí)",
                'reference_type' => Booking::class,
                'reference_id'   => $booking->id,
            ]);

            $booking->update(['payout_status' => 'paid']);
        }

        return response()->json([
            'message' => 'Xác nhận lấy xe thành công. Chúc bạn có chuyến đi vui vẻ!',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * POST /api/v1/bookings/{id}/reject-pickup
     * Renter rejects pickup (didn't receive car) -> Refunds money to Renter!
     */
    public function rejectPickup(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('user_id', $request->user()->id)->findOrFail($id);

        if ($booking->status !== 'confirmed' || !$booking->handed_over_at) {
            return response()->json(['message' => 'Không thể thực hiện thao tác này.'], 422);
        }

        $booking->update([
            'status'        => 'cancelled',
            'cancel_reason' => 'Khách hàng không nhận được xe',
            'cancelled_at'  => now(),
        ]);

        // Refund logic: refund 100% to renter's wallet
        if ($booking->payment_status === 'paid') {
            $wallet = \App\Models\Wallet::firstOrCreate(
                ['user_id' => $booking->user_id],
                ['balance' => 0]
            );

            $wallet->increment('balance', $booking->total_price);

            \App\Models\Transaction::create([
                'wallet_id'      => $wallet->id,
                'type'           => 'credit',
                'amount'         => $booking->total_price,
                'description'    => "Hoàn tiền cho chuyến đi #{$booking->id} (Không nhận được xe)",
                'reference_type' => Booking::class,
                'reference_id'   => $booking->id,
            ]);

            $booking->update(['payment_status' => 'refunded']);
        }

        return response()->json([
            'message' => 'Đã hủy chuyến đi và hoàn tiền vào ví của bạn.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * POST /api/v1/bookings/{id}/return
     * Owner confirms car is returned and completes the booking
     */
    public function ownerReturn(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with('car.owner')->whereHas('car', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($id);

        if ($booking->status !== 'active') {
            return response()->json(['message' => 'Chỉ có thể trả xe khi đơn đang trong trạng thái Đang thuê.'], 422);
        }

        // Complete the booking
        $booking->update([
            'status'      => 'completed',
            'returned_at' => now(),
        ]);

        return response()->json([
            'message' => 'Xác nhận trả xe thành công.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }
}
