<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'province'    => $this->province,
            'display_name' => $this->name === $this->province
                ? $this->province
                : "{$this->name}, {$this->province}",
            'coordinates' => $this->coordinates,
        ];
    }
}
