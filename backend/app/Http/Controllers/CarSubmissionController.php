<?php

namespace App\Http\Controllers;

use App\Http\Requests\CarSubmission\StoreCarSubmissionRequest;
use App\Models\CarImage;
use App\Models\CarSubmission;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarSubmissionController extends Controller
{
    /**
     * POST /api/v1/car-submissions
     * Public: anyone can submit (optionally with auth user_id attached)
     */
    public function store(StoreCarSubmissionRequest $request): JsonResponse
    {
        $submission = CarSubmission::create([
            ...$request->validated(),
            'user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Đăng ký ký gửi xe thành công! Chúng tôi sẽ liên hệ trong 24 giờ.',
            'data'    => [
                'id'         => $submission->id,
                'status'     => $submission->status,
                'created_at' => $submission->created_at->toDateTimeString(),
            ],
        ], 201);
    }

    /**
     * GET /api/v1/car-submissions/my
     * Auth: list current user's submissions
     */
    public function mySubmissions(Request $request): JsonResponse
    {
        $submissions = CarSubmission::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($s) => [
                'id'           => $s->id,
                'brand'        => $s->brand,
                'model'        => $s->model,
                'year'         => $s->year,
                'license_plate'=> $s->license_plate,
                'status'       => $s->status,
                'status_label' => $s->statusLabel(),
                'created_at'   => $s->created_at->toDateTimeString(),
            ]);

        return response()->json(['data' => $submissions]);
    }

    /**
     * GET /api/v1/admin/car-submissions
     * Admin: paginated list of all car submissions
     */
    public function adminList(Request $request): JsonResponse
    {
        $submissions = CarSubmission::with('user:id,name,email,phone')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('owner_name', 'like', "%{$request->search}%")
                   ->orWhere('owner_phone', 'like', "%{$request->search}%")
                   ->orWhere('license_plate', 'like', "%{$request->search}%");
            }))
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $submissions->map(fn($s) => [
                'id'                    => $s->id,
                'owner_name'            => $s->owner_name,
                'owner_phone'           => $s->owner_phone,
                'owner_email'           => $s->owner_email,
                'brand'                 => $s->brand,
                'model'                 => $s->model,
                'year'                  => $s->year,
                'license_plate'         => $s->license_plate,
                'transmission'          => $s->transmission,
                'fuel'                  => $s->fuel,
                'seats'                 => $s->seats,
                'expected_price_per_day'=> $s->expected_price_per_day,
                'location_province'     => $s->location_province,
                'description'           => $s->description,
                'status'                => $s->status,
                'status_label'          => $s->statusLabel(),
                'reject_reason'         => $s->reject_reason,
                'user'                  => $s->user ? ['id' => $s->user->id, 'name' => $s->user->name] : null,
                'created_at'            => $s->created_at->toDateTimeString(),
            ]),
            'meta' => [
                'total'     => $submissions->total(),
                'last_page' => $submissions->lastPage(),
                'current_page' => $submissions->currentPage(),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/admin/car-submissions/{id}/status
     * Admin: approve or reject a submission
     */
    public function updateSubmissionStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status'        => ['required', 'in:reviewing,approved,rejected'],
            'reject_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $submission = CarSubmission::findOrFail($id);
        $submission->update([
            'status'        => $request->status,
            'reject_reason' => $request->status === 'rejected' ? $request->reject_reason : null,
        ]);

        if ($request->status === 'approved' && $submission->user_id) {
            $slug = \Illuminate\Support\Str::slug($submission->brand . '-' . $submission->model . '-' . $submission->license_plate);
            $existing = \App\Models\Car::where('slug', $slug)->first();
            
            if (!$existing) {
                $location = $this->resolveLocation($submission->location_province);

                $car = \App\Models\Car::create([
                    'owner_id'      => $submission->user_id,
                    'location_id'   => $location->id,
                    'name'          => $submission->brand . ' ' . $submission->model,
                    'slug'          => $slug,
                    'brand'         => $submission->brand,
                    'model'         => $submission->model,
                    'year'          => $submission->year,
                    'seats'         => $submission->seats,
                    'transmission'  => $submission->transmission,
                    'fuel'          => $submission->fuel,
                    'price_per_day' => $submission->expected_price_per_day,
                    'status'        => 'available',
                    'description'   => $submission->description,
                ]);

                $this->attachSubmissionImages($car, $submission->images ?? []);
            }
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công.',
            'data'    => [
                'id'           => $submission->id,
                'status'       => $submission->status,
                'status_label' => $submission->statusLabel(),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/admin/car-submissions/{id}/approve
     * Admin: approve a submission and create car record.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $submission = CarSubmission::findOrFail($id);

        if ($submission->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể duyệt đơn đang chờ xử lý.'], 422);
        }

        $submission->update(['status' => 'approved', 'reject_reason' => null]);

        // Create a car record from submission if user exists
        if ($submission->user_id) {
            $slug = \Illuminate\Support\Str::slug($submission->brand . '-' . $submission->model . '-' . $submission->license_plate);
            if (!\App\Models\Car::withTrashed()->where('slug', $slug)->exists()) {
                $location = $this->resolveLocation($submission->location_province);
                $car = \App\Models\Car::create([
                    'owner_id'      => $submission->user_id,
                    'location_id'   => $location->id,
                    'name'          => $submission->brand . ' ' . $submission->model,
                    'slug'          => $slug,
                    'brand'         => $submission->brand,
                    'model'         => $submission->model,
                    'year'          => $submission->year,
                    'seats'         => $submission->seats,
                    'transmission'  => $submission->transmission,
                    'fuel'          => $submission->fuel,
                    'price_per_day' => $submission->expected_price_per_day,
                    'status'        => 'available',
                    'description'   => $submission->description,
                ]);

                $this->attachSubmissionImages($car, $submission->images ?? []);
            }
        }

        return response()->json([
            'message' => 'Đã duyệt đơn ký gửi xe thành công.',
            'data'    => ['id' => $submission->id, 'status' => $submission->status],
        ]);
    }

    /**
     * PATCH /api/v1/admin/car-submissions/{id}/reject
     * Admin: reject a submission with reason.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $submission = CarSubmission::findOrFail($id);

        if ($submission->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể từ chối đơn đang chờ xử lý.'], 422);
        }

        $submission->update([
            'status'        => 'rejected',
            'reject_reason' => $request->rejection_reason ?? 'Không đáp ứng yêu cầu.',
        ]);

        return response()->json([
            'message' => 'Đã từ chối đơn ký gửi xe.',
            'data'    => ['id' => $submission->id, 'status' => $submission->status],
        ]);
    }

    /**
     * GET /api/v1/car-submissions/{id}
     * Get a single submission (owner or admin).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $submission = CarSubmission::findOrFail($id);

        // Only owner or admin can view
        if ($request->user()->role !== 'admin' && $submission->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Không có quyền xem đơn này.'], 403);
        }

        return response()->json(['data' => [
            'id'                     => $submission->id,
            'owner_name'             => $submission->owner_name,
            'owner_phone'            => $submission->owner_phone,
            'brand'                  => $submission->brand,
            'model'                  => $submission->model,
            'year'                   => $submission->year,
            'license_plate'          => $submission->license_plate,
            'expected_price_per_day' => $submission->expected_price_per_day,
            'status'                 => $submission->status,
            'reject_reason'          => $submission->reject_reason,
            'created_at'             => $submission->created_at->toDateTimeString(),
        ]]);
    }

    private function resolveLocation(string $province): Location
    {
        return Location::where('province', $province)->first()
            ?? Location::create([
                'province' => $province,
                'name' => $province,
            ]);
    }

    private function attachSubmissionImages(?\App\Models\Car $car, array $images): void
    {
        if (!$car || empty($images)) {
            return;
        }

        foreach (array_values($images) as $idx => $url) {
            CarImage::firstOrCreate(
                ['car_id' => $car->id, 'image_url' => $url],
                ['is_primary' => $idx === 0]
            );
        }
    }
}
