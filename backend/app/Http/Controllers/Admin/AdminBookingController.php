<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminBookingController extends Controller
{
    /**
     * GET /api/v1/admin/bookings
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $bookings = Booking::with(['car:id,name,slug', 'user:id,name,email,phone'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('renter_name', 'like', "%{$request->search}%")
                   ->orWhere('renter_phone', 'like', "%{$request->search}%");
            }))
            ->latest()
            ->paginate(15);

        return BookingResource::collection($bookings);
    }

    /**
     * PATCH /api/v1/admin/bookings/{id}/status
     * Admin can update booking status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:confirmed,active,completed,cancelled'],
        ]);

        $booking = Booking::findOrFail($id);

        $booking->update([
            'status'       => $request->status,
            'confirmed_at' => $request->status === 'confirmed' ? now() : $booking->confirmed_at,
            'cancelled_at' => $request->status === 'cancelled' ? now() : $booking->cancelled_at,
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công.',
            'data'    => new BookingResource($booking->load('car.images')),
        ]);
    }

    /**
     * GET /api/v1/admin/bookings/{id}
     * Show a single booking with full detail.
     */
    public function show(int $id): JsonResponse
    {
        $booking = Booking::with(['car:id,name,slug', 'user:id,name,email,phone', 'car.images'])
            ->findOrFail($id);

        return response()->json(['data' => new BookingResource($booking)]);
    }
}
