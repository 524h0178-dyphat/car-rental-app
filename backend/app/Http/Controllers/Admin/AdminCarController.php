<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCarController extends Controller
{
    /**
     * GET /api/v1/admin/cars
     * List all cars including hidden/deleted.
     */
    public function index(Request $request): JsonResponse
    {
        $cars = Car::withTrashed()
            ->with(['location', 'images', 'features'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('name', 'like', "%{$request->search}%")
                   ->orWhere('brand', 'like', "%{$request->search}%");
            }))
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => CarResource::collection($cars->items()),
            'meta' => [
                'total'        => $cars->total(),
                'current_page' => $cars->currentPage(),
                'last_page'    => $cars->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/admin/cars
     * Create a new car.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'brand'         => ['required', 'string', 'max:100'],
            'model'         => ['nullable', 'string', 'max:100'],
            'year'          => ['nullable', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'seats'         => ['required', 'integer', 'min:2', 'max:16'],
            'transmission'  => ['required', 'string'],
            'fuel'          => ['required', 'string'],
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'description'   => ['nullable', 'string'],
            'location_id'   => ['nullable', 'integer', 'exists:locations,id'],
            'province'      => ['nullable', 'string', 'max:100'],
            'images'        => ['nullable', 'array'],
            'images.*'      => ['url'],
        ]);

        // Resolve or create location
        $locationId = $validated['location_id'] ?? null;
        if (!$locationId && !empty($validated['province'])) {
            $location = Location::where('province', $validated['province'])->first()
                ?? Location::create([
                    'province' => $validated['province'],
                    'name' => $validated['province'],
                ]);
            $locationId = $location->id;
        }

        $slug = Str::slug($validated['name'] . '-' . ($validated['year'] ?? date('Y')));
        // Ensure unique slug
        $baseSlug = $slug;
        $counter  = 1;
        while (Car::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $car = Car::create([
            'name'          => $validated['name'],
            'brand'         => $validated['brand'],
            'model'         => $validated['model'] ?? null,
            'year'          => $validated['year'] ?? null,
            'seats'         => $validated['seats'],
            'transmission'  => $validated['transmission'],
            'fuel'          => $validated['fuel'],
            'price_per_day' => $validated['price_per_day'],
            'description'   => $validated['description'] ?? null,
            'location_id'   => $locationId,
            'slug'          => $slug,
            'status'        => 'available',
        ]);

        // Attach images
        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $idx => $url) {
                CarImage::create([
                    'car_id'     => $car->id,
                    'image_url'  => $url,
                    'is_primary' => $idx === 0,
                ]);
            }
        }

        return response()->json([
            'message' => 'Thêm xe thành công.',
            'data'    => new CarResource($car->load(['location', 'images', 'features'])),
        ], 201);
    }

    /**
     * PUT /api/v1/admin/cars/{id}
     * Update car information.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $car = Car::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'name'          => ['sometimes', 'string', 'max:255'],
            'brand'         => ['sometimes', 'string', 'max:100'],
            'model'         => ['nullable', 'string', 'max:100'],
            'year'          => ['nullable', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'seats'         => ['sometimes', 'integer', 'min:2', 'max:16'],
            'transmission'  => ['sometimes', 'string'],
            'fuel'          => ['sometimes', 'string'],
            'price_per_day' => ['sometimes', 'numeric', 'min:0'],
            'description'   => ['nullable', 'string'],
            'location_id'   => ['nullable', 'integer', 'exists:locations,id'],
            'status'        => ['sometimes', 'in:available,rented,hidden'],
        ]);

        $car->update($validated);

        return response()->json([
            'message' => 'Cập nhật xe thành công.',
            'data'    => new CarResource($car->load(['location', 'images', 'features'])),
        ]);
    }

    /**
     * PATCH /api/v1/admin/cars/{id}/hide
     * Toggle car visibility.
     */
    public function hide(int $id): JsonResponse
    {
        $car = Car::findOrFail($id);
        $newStatus = $car->status === 'hidden' ? 'available' : 'hidden';
        $car->update(['status' => $newStatus]);

        return response()->json([
            'message' => $newStatus === 'hidden' ? 'Đã ẩn xe.' : 'Đã hiện xe.',
            'data'    => ['id' => $car->id, 'status' => $car->status],
        ]);
    }

    /**
     * DELETE /api/v1/admin/cars/{id}
     * Soft-delete a car.
     */
    public function destroy(int $id): JsonResponse
    {
        $car = Car::findOrFail($id);
        $car->delete(); // soft delete

        return response()->json(['message' => 'Đã xóa xe thành công.']);
    }
}
