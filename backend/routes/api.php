<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CarSubmissionController;
use App\Http\Controllers\FilterMetaController;
use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes – BonBonCar
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Auth (public) ────────────────────────────────────────────────────
    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });

    // ── Auth (protected) ─────────────────────────────────────────────────
    Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
        Route::post('/logout',       [AuthController::class, 'logout']);
        Route::get('/me',            [AuthController::class, 'me']);
        Route::patch('/profile',     [AuthController::class, 'updateProfile']);
        Route::patch('/password',    [AuthController::class, 'changePassword']);
    });

    // ── Filter meta ───────────────────────────────────────────────────────
    Route::get('/filter-meta', [FilterMetaController::class, 'index']);

    // ── Cars (public) ────────────────────────────────────────────────────
    Route::get('/cars/featured', [CarController::class, 'featured']);
    Route::get('/cars',          [CarController::class, 'index'])->middleware('throttle:60,1');
    Route::get('/cars/{slug}',   [CarController::class, 'show']);

    // ── Locations ────────────────────────────────────────────────────────
    Route::get('/locations', [LocationController::class, 'index']);

    // ── Bookings (protected) ─────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/bookings',             [BookingController::class, 'index']);
        Route::post('/bookings',            [BookingController::class, 'store']);
        Route::get('/bookings/{id}',        [BookingController::class, 'show']);
        Route::post('/bookings/{id}/cancel',[BookingController::class, 'cancel']);
    });

    // ── Admin (auth + admin role) ─────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::get('/stats',                      [\App\Http\Controllers\Admin\DashboardController::class,    'stats']);
        Route::get('/bookings',                   [\App\Http\Controllers\Admin\AdminBookingController::class, 'index']);
        Route::patch('/bookings/{id}/status',     [\App\Http\Controllers\Admin\AdminBookingController::class, 'updateStatus']);
        Route::get('/car-submissions',                 [CarSubmissionController::class, 'adminList']);
        Route::patch('/car-submissions/{id}/status',   [CarSubmissionController::class, 'updateSubmissionStatus']);
    });

    // ── Car Submissions (ký gửi xe) ───────────────────────────────────────
    // Public POST — anyone can submit (auth optional via sanctum:api)
    Route::post('/car-submissions',      [CarSubmissionController::class, 'store']); // removed throttle for testing
    // Protected GET — view own submissions
    Route::middleware('auth:sanctum')->get('/car-submissions/my', [CarSubmissionController::class, 'mySubmissions']);
});
