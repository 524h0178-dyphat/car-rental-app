<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * POST /api/v1/reviews
     * Create a review for a completed booking.
     *
     * Business rules (spec §4):
     *  - Customer must be signed in.
     *  - Booking must belong to the authenticated user.
     *  - Booking must be in status 'completed'.
     *  - One review per booking (unique constraint on booking_id).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'comment'    => ['nullable', 'string', 'max:2000'],
        ]);

        // Verify the booking belongs to the authenticated user
        $booking = Booking::where('user_id', $request->user()->id)
            ->findOrFail($request->booking_id);

        // Must be completed
        if ($booking->status !== 'completed') {
            return response()->json([
                'message' => 'Chỉ có thể viết đánh giá cho chuyến đi đã hoàn thành.',
            ], 403);
        }

        // One review per booking
        if (Review::where('booking_id', $booking->id)->exists()) {
            return response()->json([
                'message' => 'Bạn đã đánh giá chuyến đi này rồi.',
            ], 422);
        }

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'car_id'     => $booking->car_id,
            'booking_id' => $booking->id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
            'status'     => 'visible',
        ]);

        return response()->json([
            'message' => 'Cảm ơn bạn đã đánh giá!',
            'data'    => [
                'id'         => $review->id,
                'rating'     => $review->rating,
                'comment'    => $review->comment,
                'created_at' => $review->created_at->toDateTimeString(),
            ],
        ], 201);
    }

    /**
     * GET /api/v1/reviews/my
     * List authenticated user's reviews.
     */
    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::with(['car:id,name,slug', 'booking:id,start_date,end_date'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'status'     => $r->status,
                'created_at' => $r->created_at->toDateTimeString(),
                'car'        => $r->car ? ['id' => $r->car->id, 'name' => $r->car->name, 'slug' => $r->car->slug] : null,
                'booking'    => $r->booking ? [
                    'id'         => $r->booking->id,
                    'start_date' => $r->booking->start_date?->toDateString(),
                    'end_date'   => $r->booking->end_date?->toDateString(),
                ] : null,
            ]);

        return response()->json(['data' => $reviews]);
    }

    /**
     * GET /api/v1/cars/{id}/reviews
     * Public: list visible reviews for a car.
     */
    public function carReviews(int $carId): JsonResponse
    {
        $car = Car::findOrFail($carId);

        $reviews = Review::with(['user:id,name,avatar'])
            ->where('car_id', $car->id)
            ->where('status', 'visible')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $reviews->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at->toDateTimeString(),
                'user'       => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name, 'avatar' => $r->user->avatar] : null,
            ]),
            'meta' => [
                'total'        => $reviews->total(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
            'average_rating' => round(
                Review::where('car_id', $car->id)->where('status', 'visible')->avg('rating') ?? 0,
                1
            ),
        ]);
    }
}
