<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'handed_over_at', 'picked_up_at', 'returned_at', 'payout_status',
    ];

    protected $casts = [
        'start_date'     => 'date',
        'end_date'       => 'date',
        'confirmed_at'   => 'datetime',
        'cancelled_at'   => 'datetime',
        'handed_over_at' => 'datetime',
        'picked_up_at'   => 'datetime',
        'returned_at'    => 'datetime',
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

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
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

    /** Whether this booking can be reviewed */
    public function canBeReviewed(): bool
    {
        return $this->status === 'completed' && $this->review === null;
    }
}
