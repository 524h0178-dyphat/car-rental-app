<?php

namespace App\Http\Controllers;

use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// [BACKEND REVIEW]
// ✅ Public read-only endpoint – no auth required
// ✅ Response: Via LocationResource – minimal fields
// ✅ DB Optimization: Simple query, no N+1 risk

class LocationController extends Controller
{
    /**
     * GET /api/locations
     * Return all locations grouped by province.
     */
    public function index(): AnonymousResourceCollection
    {
        $locations = Location::orderBy('province')->orderBy('name')->get();

        return LocationResource::collection($locations);
    }
}
