<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();

            // Rental period
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('total_days');

            // Pricing snapshot (so price changes don't affect past bookings)
            $table->unsignedBigInteger('price_per_day');
            $table->unsignedBigInteger('total_price');

            // Renter info (stored separately in case profile changes)
            $table->string('renter_name');
            $table->string('renter_phone', 20);
            $table->string('renter_cccd', 20);
            $table->string('renter_license', 30)->nullable();

            // Delivery
            $table->string('pickup_address')->nullable();
            $table->string('pickup_note')->nullable();

            // Payment
            $table->enum('payment_method', ['bank_transfer', 'cash', 'momo'])->default('bank_transfer');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');

            // Booking lifecycle
            $table->enum('status', [
                'pending',    // Chờ xác nhận
                'confirmed',  // Đã xác nhận
                'active',     // Đang thuê
                'completed',  // Đã hoàn thành
                'cancelled',  // Đã hủy
            ])->default('pending');

            $table->text('note')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['car_id', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
