<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * POST /api/v1/payments
     * Create a payment for a booking (mock gateway).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'method'     => ['required', 'string', 'in:cash,bank_transfer,momo,vnpay,stripe'],
        ]);

        $booking = Booking::where('user_id', $request->user()->id)
            ->findOrFail($request->booking_id);

        if ($booking->payment_status === 'paid') {
            return response()->json(['message' => 'Booking này đã được thanh toán rồi.'], 400);
        }

        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return response()->json(['message' => 'Không thể thanh toán cho booking ở trạng thái này.'], 400);
        }

        // Remove existing failed payment if any
        Payment::where('booking_id', $booking->id)
            ->where('status', 'failed')
            ->delete();

        return DB::transaction(function () use ($request, $booking) {
            // Mock: create a payment record (simulates gateway initiation)
            $payment = Payment::create([
                'booking_id'     => $booking->id,
                'amount'         => $booking->total_price,
                'method'         => $request->method,
                'gateway'        => 'mock',
                'transaction_id' => 'MOCK-' . strtoupper(uniqid()),
                'status'         => 'paid', // Mock: auto-succeed
                'paid_at'        => now(),
            ]);

            // Update booking payment status
            $booking->update([
                'payment_status' => 'paid',
                'payment_method' => $request->method,
            ]);

            return response()->json([
                'message' => 'Thanh toán thành công!',
                'data'    => [
                    'payment_id'     => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'amount'         => $payment->amount,
                    'method'         => $payment->method,
                    'status'         => $payment->status,
                    'paid_at'        => $payment->paid_at->toDateTimeString(),
                ],
            ]);
        });
    }

    /**
     * GET /api/v1/payments/{id}
     * Show payment details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $payment = Payment::whereHas('booking', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($id);

        return response()->json(['data' => [
            'id'             => $payment->id,
            'booking_id'     => $payment->booking_id,
            'amount'         => $payment->amount,
            'method'         => $payment->method,
            'gateway'        => $payment->gateway,
            'transaction_id' => $payment->transaction_id,
            'status'         => $payment->status,
            'paid_at'        => $payment->paid_at?->toDateTimeString(),
        ]]);
    }

    /**
     * POST /api/v1/payments/callback
     * Mock payment gateway callback.
     */
    public function callback(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => ['required', 'string'],
            'status'         => ['required', 'in:paid,failed'],
        ]);

        $payment = Payment::where('transaction_id', $request->transaction_id)->firstOrFail();

        DB::transaction(function () use ($request, $payment) {
            $payment->update([
                'status'  => $request->status,
                'paid_at' => $request->status === 'paid' ? now() : null,
            ]);

            if ($request->status === 'paid') {
                $payment->booking->update(['payment_status' => 'paid']);
            } else {
                $payment->booking->update(['payment_status' => 'failed']);
            }
        });

        return response()->json(['message' => 'Callback xử lý thành công.']);
    }
}
