<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CarSubmissionController;
use App\Http\Controllers\FilterMetaController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes – SkidibiCar
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
        Route::get('/profile',       [AuthController::class, 'me']);         // spec alias
        Route::put('/profile',       [AuthController::class, 'updateProfile']); // spec: PUT
        Route::patch('/profile',     [AuthController::class, 'updateProfile']);
        Route::put('/password',      [AuthController::class, 'changePassword']); // spec: PUT
        Route::patch('/password',    [AuthController::class, 'changePassword']);
        
        // Email Verification & Change
        Route::post('/request-verification', [AuthController::class, 'requestVerification']);
        Route::post('/verify-email',         [AuthController::class, 'verifyEmail']);
        Route::post('/request-email-change', [AuthController::class, 'requestEmailChange']);
        Route::post('/verify-email-change',  [AuthController::class, 'verifyEmailChange']);
    });

    // ── Filter meta ───────────────────────────────────────────────────────
    Route::get('/filter-meta', [FilterMetaController::class, 'index']);

    // ── Locations ────────────────────────────────────────────────────────
    Route::get('/locations', [LocationController::class, 'index']);

    // ── Cars (public) ────────────────────────────────────────────────────
    Route::get('/cars/featured', [CarController::class, 'featured']);
    Route::get('/cars',          [CarController::class, 'index'])->middleware('throttle:60,1');
    Route::get('/cars/{slug}/availability', [CarController::class, 'availability']);
    Route::get('/cars/{id}',     [CarController::class, 'show']);

    // ── Car reviews (public) ──────────────────────────────────────────────
    Route::get('/cars/{id}/reviews', [ReviewController::class, 'carReviews']);

    // ── Bookings (protected + blocked check) ─────────────────────────────
    Route::middleware(['auth:sanctum', 'not_blocked'])->group(function () {
        Route::post('/bookings/preview',   [BookingController::class, 'preview']);
        Route::get('/bookings',            [BookingController::class, 'index']);
        Route::post('/bookings',           [BookingController::class, 'store']);
        Route::get('/bookings/my',         [BookingController::class, 'index']);     // spec alias
        Route::get('/bookings/owner',      [BookingController::class, 'ownerIndex']);
        Route::get('/bookings/{id}',       [BookingController::class, 'show']);
        Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
        Route::post('/bookings/{id}/cancel',  [BookingController::class, 'cancel']); // keep old

        // P2P workflow routes
        Route::post('/bookings/{id}/owner-confirm',  [BookingController::class, 'ownerConfirm']);
        Route::post('/bookings/{id}/owner-reject',   [BookingController::class, 'ownerReject']);
        Route::post('/bookings/{id}/owner-handover', [BookingController::class, 'ownerHandover']);
        Route::post('/bookings/{id}/pickup',         [BookingController::class, 'pickup']);
        Route::post('/bookings/{id}/reject-pickup',  [BookingController::class, 'rejectPickup']);
        Route::post('/bookings/{id}/return',         [BookingController::class, 'ownerReturn']);
        Route::post('/bookings/{id}/mock-payment',   [BookingController::class, 'mockPayment']);
    });

    // ── Payments (protected + blocked check) ──────────────────────────────
    Route::middleware(['auth:sanctum', 'not_blocked'])->group(function () {
        Route::post('/payments',           [PaymentController::class, 'store']);
        Route::get('/payments/{id}',       [PaymentController::class, 'show']);
        Route::post('/payments/callback',  [PaymentController::class, 'callback']);
    });

    // ── Reviews (protected + blocked check) ───────────────────────────────
    Route::middleware(['auth:sanctum', 'not_blocked'])->group(function () {
        Route::post('/reviews',     [ReviewController::class, 'store']);
        Route::get('/reviews/my',   [ReviewController::class, 'myReviews']);
    });

    // ── Car Submissions (protected + blocked check) ───────────────────────
    Route::middleware(['auth:sanctum', 'not_blocked'])->group(function () {
        Route::post('/car-submissions',        [CarSubmissionController::class, 'store']);
        Route::get('/car-submissions/my',      [CarSubmissionController::class, 'mySubmissions']);
        Route::get('/car-submissions/{id}',    [CarSubmissionController::class, 'show'])
            ->middleware('auth:sanctum');
        Route::put('/cars/{id}',               [CarController::class, 'update']);
    });

    // ── Wallet ────────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/wallet', [\App\Http\Controllers\WalletController::class, 'index']);
    });

    // ── Admin (auth + admin role) ─────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        // Dashboard stats
        Route::get('/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);

        // Members (spec: §6 Admin Members)
        Route::get('/users',                  [\App\Http\Controllers\Admin\AdminUserController::class, 'index']);
        Route::patch('/users/{id}/status',    [\App\Http\Controllers\Admin\AdminUserController::class, 'updateStatus']);

        // Cars (spec: §6 Admin Cars)
        Route::get('/cars',                   [\App\Http\Controllers\Admin\AdminCarController::class, 'index']);
        Route::post('/cars',                  [\App\Http\Controllers\Admin\AdminCarController::class, 'store']);
        Route::put('/cars/{id}',              [\App\Http\Controllers\Admin\AdminCarController::class, 'update']);
        Route::patch('/cars/{id}/hide',       [\App\Http\Controllers\Admin\AdminCarController::class, 'hide']);
        Route::delete('/cars/{id}',           [\App\Http\Controllers\Admin\AdminCarController::class, 'destroy']);

        // Bookings (spec: §6 Admin Bookings)
        Route::get('/bookings',               [\App\Http\Controllers\Admin\AdminBookingController::class, 'index']);
        Route::get('/bookings/{id}',          [\App\Http\Controllers\Admin\AdminBookingController::class, 'show'])->missing(fn() => response()->json(['message' => 'Không tìm thấy.'], 404));
        Route::patch('/bookings/{id}/status', [\App\Http\Controllers\Admin\AdminBookingController::class, 'updateStatus']);

        // Car Submissions (spec: §6 Admin Car Submissions)
        Route::get('/car-submissions',                    [CarSubmissionController::class, 'adminList']);
        Route::get('/car-submissions/{id}',               [CarSubmissionController::class, 'show']);
        Route::patch('/car-submissions/{id}/approve',     [CarSubmissionController::class, 'approve']);
        Route::patch('/car-submissions/{id}/reject',      [CarSubmissionController::class, 'reject']);
        Route::patch('/car-submissions/{id}/status',      [CarSubmissionController::class, 'updateSubmissionStatus']); // keep legacy

        // Reviews (spec: §6 Admin Reviews)
        Route::get('/reviews',                [\App\Http\Controllers\Admin\AdminReviewController::class, 'index']);
        Route::patch('/reviews/{id}/hide',    [\App\Http\Controllers\Admin\AdminReviewController::class, 'hide']);
        Route::delete('/reviews/{id}',        [\App\Http\Controllers\Admin\AdminReviewController::class, 'destroy']);
    });
});
