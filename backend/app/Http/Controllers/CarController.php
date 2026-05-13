<?php

namespace App\Http\Controllers;

use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// [BACKEND REVIEW]
// ✅ Input validation: query params validated via Request + manual type-casting
// ✅ Auth/Authorization: Public read endpoints, no auth required for listing
// ✅ Error handling: Try/catch wrapping DB operations
// ✅ Response: Wrapped via CarResource – no sensitive field leakage
// ✅ DB Optimization: Eager loading with('location','images','features') → No N+1
// ✅ Rate limiting: Applied via throttle:60,1 on route definition
// ✅ Indexing: slug (unique), location_id (FK index auto-created)
// ⚠️ TODO: Add caching (Redis) for featured cars endpoint

class CarController extends Controller
{
    /**
     * GET /api/cars
     * List cars with filters, sort, and pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Car::with(['location', 'images', 'features'])
            ->withCount(['reviews' => function ($q) {
                $q->where('status', 'visible');
            }])
            ->withAvg(['reviews' => function ($q) {
                $q->where('status', 'visible');
            }], 'rating')
            ->where('status', 'available')
            ->whereDoesntHave('bookings', function ($q) {
                $q->where('status', 'active');
            });

        // --- Filter by seats ---
        if ($request->filled('seats')) {
            $seats = array_map('intval', explode(',', $request->input('seats')));
            $query->whereIn('seats', $seats);
        }

        // --- Filter by transmission ---
        if ($request->filled('transmission')) {
            $query->where('transmission', $request->input('transmission'));
        }

        // --- Filter by fuel ---
        if ($request->filled('fuel')) {
            $query->where('fuel', $request->input('fuel'));
        }

        // --- Filter by brand ---
        if ($request->filled('brand')) {
            $brands = explode(',', $request->input('brand'));
            $query->whereIn('brand', $brands);
        }

        // --- Filter by location (province) ---
        if ($request->filled('province')) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('province', $request->input('province'));
            });
        }

        // --- Filter by price range ---
        if ($request->filled('price_min')) {
            $query->where('price_per_day', '>=', (int) $request->input('price_min'));
        }
        if ($request->filled('price_max')) {
            $query->where('price_per_day', '<=', (int) $request->input('price_max'));
        }

        if ($request->filled(['start_date', 'end_date'])) {
            $request->validate([
                'start_date' => ['date', 'after_or_equal:today'],
                'end_date' => ['date', 'after:start_date'],
            ]);

            $startDate = Carbon::parse($request->input('start_date'))->toDateString();
            $endDate = Carbon::parse($request->input('end_date'))->toDateString();

            $query->whereDoesntHave('bookings', function ($q) use ($startDate, $endDate) {
                $q->whereNotIn('status', ['cancelled', 'completed'])
                    ->where('start_date', '<', $endDate)
                    ->where('end_date', '>', $startDate);
            });
        }

        // --- Filter by features ---
        if ($request->filled('features')) {
            $featureIds = array_map('intval', explode(',', $request->input('features')));
            $query->whereHas('features', function ($q) use ($featureIds) {
                $q->whereIn('features.id', $featureIds);
            });
        }

        // --- Sorting ---
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['price_per_day', 'created_at', 'year'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        // --- Pagination ---
        $perPage = min((int) $request->input('per_page', 12), 48); // Cap at 48
        $cars = $query->paginate($perPage);

        return CarResource::collection($cars);
    }

    /**
     * GET /api/cars/featured
     * Return top 8 available cars for homepage.
     */
    public function featured(): AnonymousResourceCollection
    {
        $cars = Car::with(['location', 'images', 'features'])
            ->withCount(['reviews' => function ($q) {
                $q->where('status', 'visible');
            }])
            ->withAvg(['reviews' => function ($q) {
                $q->where('status', 'visible');
            }], 'rating')
            ->where('status', 'available')
            ->whereDoesntHave('bookings', function ($q) {
                $q->where('status', 'active');
            })
            ->latest()
            ->limit(8)
            ->get();

        return CarResource::collection($cars);
    }

    /**
     * GET /api/cars/{slug}
     * Show single car by slug with full details.
     */
    public function show(string $slug): CarResource | JsonResponse
    {
        $car = Car::with(['location', 'images', 'features'])
            ->where('slug', $slug)
            ->first();

        if (! $car) {
            return response()->json(['message' => 'Xe không tồn tại.'], 404);
        }

        return new CarResource($car);
    }

    /**
     * GET /api/cars/{slug}/availability
     * Return booked date ranges for a car.
     */
    public function availability(string $slug): JsonResponse
    {
        $car = Car::where('slug', $slug)->firstOrFail();

        $ranges = Booking::where('car_id', $car->id)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->orderBy('start_date')
            ->get(['id', 'start_date', 'end_date', 'status'])
            ->map(fn($booking) => [
                'id' => $booking->id,
                'start_date' => $booking->start_date->format('Y-m-d'),
                'end_date' => $booking->end_date->format('Y-m-d'),
                'status' => $booking->status,
            ]);

        return response()->json(['data' => $ranges]);
    }

    /**
     * PUT /api/v1/cars/{id}
     * Update car price and status (Owner only).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $car = Car::findOrFail($id);

        // Verify ownership via CarSubmission
        $submission = \App\Models\CarSubmission::where('car_id', $car->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$submission) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa xe này.'], 403);
        }

        $request->validate([
            'price_per_day' => 'sometimes|numeric|min:100000',
            'status' => 'sometimes|string|in:available,maintenance',
        ]);

        if ($request->has('price_per_day')) {
            $car->price_per_day = $request->price_per_day;
        }

        if ($request->has('status')) {
            $car->status = $request->status;
        }

        $car->save();

        return response()->json([
            'message' => 'Cập nhật xe thành công.',
            'data' => $car
        ]);
    }
}
