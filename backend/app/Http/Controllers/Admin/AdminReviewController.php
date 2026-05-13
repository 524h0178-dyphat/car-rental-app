<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    /**
     * GET /api/v1/admin/reviews
     * List all reviews (visible and hidden).
     */
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::withTrashed()
            ->with(['user:id,name,email', 'car:id,name,slug'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('car_id'), fn($q) => $q->where('car_id', $request->car_id))
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $reviews->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'status'     => $r->status,
                'deleted_at' => $r->deleted_at?->toDateTimeString(),
                'created_at' => $r->created_at?->toDateTimeString(),
                'user'       => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name] : null,
                'car'        => $r->car  ? ['id' => $r->car->id, 'name' => $r->car->name]   : null,
            ]),
            'meta' => [
                'total'        => $reviews->total(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/admin/reviews/{id}/hide
     * Hide a review.
     */
    public function hide(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'hidden']);

        return response()->json(['message' => 'Đã ẩn đánh giá.']);
    }

    /**
     * DELETE /api/v1/admin/reviews/{id}
     * Soft-delete a review.
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->delete(); // soft delete

        return response()->json(['message' => 'Đã xóa đánh giá.']);
    }
}
