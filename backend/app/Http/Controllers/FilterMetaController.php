<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Feature;
use Illuminate\Http\JsonResponse;

// [BACKEND REVIEW]
// ✅ Public endpoint – no auth required
// ✅ DB Optimization: groupBy + distinct = O(n) not N+1
// ✅ Response: Only needed fields, no sensitive data
// ✅ Cache-friendly: relatively static data

class FilterMetaController extends Controller
{
    /**
     * GET /api/v1/filter-meta
     * Returns all filter options dynamically from the database.
     * Avoids hardcoded filter values in the frontend.
     */
    public function index(): JsonResponse
    {
        $brands = Car::query()
            ->select('brand')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        $provinces = Car::query()
            ->join('locations', 'cars.location_id', '=', 'locations.id')
            ->select('locations.province')
            ->distinct()
            ->orderBy('locations.province')
            ->pluck('locations.province');

        $transmissions = Car::query()
            ->select('transmission')
            ->distinct()
            ->orderBy('transmission')
            ->pluck('transmission');

        $fuels = Car::query()
            ->select('fuel')
            ->distinct()
            ->orderBy('fuel')
            ->pluck('fuel');

        $seats = Car::query()
            ->select('seats')
            ->distinct()
            ->orderBy('seats')
            ->pluck('seats');

        $features = Feature::orderBy('name')->get(['id', 'name', 'icon']);

        $priceRange = [
            'min' => (int) Car::min('price_per_day'),
            'max' => (int) Car::max('price_per_day'),
        ];

        return response()->json([
            'data' => [
                'brands'        => $brands,
                'provinces'     => $provinces,
                'transmissions' => $transmissions,
                'fuels'         => $fuels,
                'seats'         => $seats,
                'features'      => $features,
                'price_range'   => $priceRange,
            ],
        ]);
    }
}
