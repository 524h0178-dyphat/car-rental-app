<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'status'         => $this->status,
            'status_label'   => $this->statusLabel(),
            'start_date'     => $this->start_date->format('Y-m-d'),
            'end_date'       => $this->end_date->format('Y-m-d'),
            'total_days'     => $this->total_days,
            'price_per_day'  => $this->price_per_day,
            'total_price'    => $this->total_price,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'renter_name'    => $this->renter_name,
            'renter_phone'   => $this->renter_phone,
            'pickup_address' => $this->pickup_address,
            'note'           => $this->note,
            'cancel_reason'  => $this->cancel_reason,
            'confirmed_at'   => $this->confirmed_at?->toDateTimeString(),
            'created_at'     => $this->created_at->toDateTimeString(),

            // Nested relationships
            'car' => $this->whenLoaded('car', fn() => [
                'id'    => $this->car->id,
                'name'  => $this->car->name,
                'slug'  => $this->car->slug,
                'brand' => $this->car->brand,
                'image' => $this->car->images->where('is_primary', true)->first()?->image_url,
            ]),
        ];
    }
}
