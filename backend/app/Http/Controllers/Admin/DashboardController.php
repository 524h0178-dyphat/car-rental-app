<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/admin/stats
     * Returns key platform statistics for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $totalCars     = Car::count();
        $availableCars = Car::where('status', 'available')->count();
        $totalUsers    = User::where('role', 'customer')->count();
        $totalBookings = Booking::count();

        $revenueConfirmed = Booking::whereIn('status', ['active', 'completed'])
            ->get()
            ->sum(function($b) {
                return $b->commission_amount ?? ($b->total_price * 0.1);
            });

        $totalGmv = Booking::whereIn('status', ['active', 'completed'])
            ->sum('total_price');

        $bookingsByStatus = Booking::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentBookings = Booking::with(['car:id,name,slug', 'user:id,name,email'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn($b) => [
                'id'           => $b->id,
                'status'       => $b->status,
                'status_label' => $b->statusLabel(),
                'total_price'  => $b->total_price,
                'renter_name'  => $b->renter_name,
                'start_date'   => $b->start_date->format('d/m/Y'),
                'end_date'     => $b->end_date->format('d/m/Y'),
                'car_name'     => $b->car?->name,
                'car_slug'     => $b->car?->slug,
                'created_at'   => $b->created_at->diffForHumans(),
            ]);

        // Monthly revenue (last 6 months)
        $monthlyRevenue = Booking::whereIn('status', ['active', 'completed'])
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(COALESCE(commission_amount, total_price * 0.1)) as revenue, COUNT(*) as count')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get();

        return response()->json([
            'data' => [
                'total_cars'       => $totalCars,
                'available_cars'   => $availableCars,
                'total_users'      => $totalUsers,
                'total_bookings'   => $totalBookings,
                'revenue'          => $revenueConfirmed,
                'total_amount'     => $totalGmv,
                'bookings_status'  => $bookingsByStatus,
                'recent_bookings'  => $recentBookings,
                'monthly_revenue'  => $monthlyRevenue,
            ],
        ]);
    }
}
