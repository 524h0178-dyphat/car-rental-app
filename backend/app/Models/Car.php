<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id', 'location_id', 'name', 'slug', 'brand', 'model', 'year', 'seats',
        'transmission', 'fuel', 'price_per_day', 'status', 'description',
    ];

    // Alias: spec uses 'fuel_type', DB uses 'fuel'
    public function getFuelTypeAttribute(): ?string
    {
        return $this->fuel;
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function images()
    {
        return $this->hasMany(CarImage::class);
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->where('status', 'visible');
    }

    /**
     * Check if the car has any confirmed/pending booking in the given date range.
     */
    public function hasOverlapBooking(string $startDate, string $endDate): bool
    {
        return $this->bookings()
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->where('start_date', '<=', $startDate)
                         ->where('end_date', '>=', $endDate);
                  });
            })
            ->exists();
    }
}
