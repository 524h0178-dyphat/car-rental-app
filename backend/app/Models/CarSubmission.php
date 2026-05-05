<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarSubmission extends Model
{
    protected $fillable = [
        'owner_name', 'owner_phone', 'owner_email', 'owner_cccd', 'owner_address',
        'brand', 'model', 'year', 'license_plate', 'transmission', 'fuel', 'seats',
        'expected_price_per_day', 'location_province', 'description',
        'status', 'reject_reason', 'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'pending'   => 'Chờ xét duyệt',
            'reviewing' => 'Đang xem xét',
            'approved'  => 'Đã duyệt',
            'rejected'  => 'Từ chối',
            default     => $this->status,
        };
        }
}
