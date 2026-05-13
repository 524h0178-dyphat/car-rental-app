<?php

namespace Tests\Unit;

use App\Support\BookingStatusTransitions;
use PHPUnit\Framework\TestCase;

class BookingStatusTransitionsTest extends TestCase
{
    public function test_allowed_transitions_are_explicit(): void
    {
        $this->assertTrue(BookingStatusTransitions::canTransition('pending', 'confirmed'));
        $this->assertTrue(BookingStatusTransitions::canTransition('pending', 'cancelled'));
        $this->assertTrue(BookingStatusTransitions::canTransition('confirmed', 'active'));
        $this->assertTrue(BookingStatusTransitions::canTransition('active', 'completed'));
    }

    public function test_terminal_statuses_do_not_transition(): void
    {
        $this->assertFalse(BookingStatusTransitions::canTransition('completed', 'confirmed'));
        $this->assertFalse(BookingStatusTransitions::canTransition('cancelled', 'confirmed'));
        $this->assertSame([], BookingStatusTransitions::nextStatuses('completed'));
    }
}
