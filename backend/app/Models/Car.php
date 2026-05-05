<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    /** @use HasFactory<\Database\Factories\CarFactory> */
    use HasFactory;

    protected $fillable = [
        'location_id', 'name', 'slug', 'brand', 'model', 'year', 'seats',
        'transmission', 'fuel', 'price_per_day', 'status', 'description'
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function images()
    {
        return $this->hasMany(CarImage::class);
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class);
    }
}
