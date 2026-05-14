<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'slug'         => $this->slug,
            'brand'        => $this->brand,
            'model'        => $this->model,
            'year'         => $this->year,
            'seats'        => $this->seats,
            'transmission' => $this->transmission,
            'fuel'         => $this->fuel,
            'price_per_day'=> (int) $this->price_per_day,
            'status'       => $this->status,
            'description'  => $this->description,
            'location'     => new LocationResource($this->whenLoaded('location')),
            'images'       => CarImageResource::collection($this->whenLoaded('images')),
            'features'     => FeatureResource::collection($this->whenLoaded('features')),
            'reviews_count' => $this->reviews_count ?? 0,
            'reviews_avg_rating' => (float) ($this->reviews_avg_rating ?? 0.0),
            'primary_image'=> $this->whenLoaded('images', fn() =>
                $this->images->where('is_primary', true)->first()?->image_url
                ?? $this->images->first()?->image_url
            ),
            'created_at'   => $this->created_at?->toISOString(),
            'deleted_at'   => $this->deleted_at?->toISOString(),
        ];
    }
}
