<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id', 'car_id',
        'start_date', 'end_date', 'total_days',
        'price_per_day', 'total_price',
        'renter_name', 'renter_phone', 'renter_cccd', 'renter_license',
        'pickup_address', 'pickup_note',
        'payment_method', 'payment_status',
        'status', 'note', 'cancel_reason',
        'confirmed_at', 'cancelled_at',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    // ── Helpers ────────────────────────────────────────────────────────

    /** Human-readable status label */
    public function statusLabel(): string
    {
        return match ($this->status) {
            'pending'   => 'Chờ xác nhận',
            'confirmed' => 'Đã xác nhận',
            'active'    => 'Đang thuê',
            'completed' => 'Đã hoàn thành',
            'cancelled' => 'Đã hủy',
            default     => $this->status,
        };
    }
}
