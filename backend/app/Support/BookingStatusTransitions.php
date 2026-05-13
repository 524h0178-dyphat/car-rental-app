<?php

namespace App\Support;

class BookingStatusTransitions
{
    private const ALLOWED = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['active', 'cancelled'],
        'active' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
    ];

    public static function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::ALLOWED[$from] ?? [], true);
    }

    /**
     * @return array<int, string>
     */
    public static function nextStatuses(string $from): array
    {
        return self::ALLOWED[$from] ?? [];
    }
}
