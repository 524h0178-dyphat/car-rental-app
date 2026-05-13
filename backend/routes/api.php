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
| API Routes – SkibidiCar
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Auth (public) ────────────────────────────────────────────────────
    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/verify-otp',      [AuthController::class, 'verifyOtp']);
        Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
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
        Route::get('/bookings/owner',       [BookingController::class, 'ownerIndex']);
        Route::get('/bookings/{id}',        [BookingController::class, 'show']);
        Route::post('/bookings/{id}/cancel',[BookingController::class, 'cancel']);
        Route::post('/bookings/{id}/mock-payment', [BookingController::class, 'mockPayment']);
        
        // P2P Workflow routes
        Route::post('/bookings/{id}/owner-confirm', [BookingController::class, 'ownerConfirm']);
        Route::post('/bookings/{id}/owner-reject',  [BookingController::class, 'ownerReject']);
        Route::post('/bookings/{id}/owner-handover',[BookingController::class, 'ownerHandover']);
        Route::post('/bookings/{id}/pickup',        [BookingController::class, 'pickup']);
        Route::post('/bookings/{id}/reject-pickup', [BookingController::class, 'rejectPickup']);
        Route::post('/bookings/{id}/return',        [BookingController::class, 'ownerReturn']);
        
        // Wallet
        Route::get('/wallet',                       [\App\Http\Controllers\WalletController::class, 'index']);
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
    // Protected POST — Only logged in users can submit for P2P
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/car-submissions', [CarSubmissionController::class, 'store']);
        Route::get('/car-submissions/my', [CarSubmissionController::class, 'mySubmissions']);
    });
});
