<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('car_submissions', function (Blueprint $table) {
            $table->id();

            // Owner info
            $table->string('owner_name');
            $table->string('owner_phone', 20);
            $table->string('owner_email');
            $table->string('owner_cccd', 20);
            $table->string('owner_address')->nullable();

            // Car info
            $table->string('brand');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->string('license_plate', 20);
            $table->enum('transmission', ['Số tự động', 'Số sàn']);
            $table->enum('fuel', ['Xăng', 'Dầu', 'Điện', 'Hybrid'])->default('Xăng');
            $table->unsignedTinyInteger('seats');
            $table->unsignedBigInteger('expected_price_per_day');
            $table->string('location_province');
            $table->text('description')->nullable();

            // Status
            $table->enum('status', ['pending', 'reviewing', 'approved', 'rejected'])->default('pending');
            $table->text('reject_reason')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_submissions');
    }
};
