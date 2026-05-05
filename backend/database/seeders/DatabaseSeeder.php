<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Tạo users + gọi RealCarSeeder (30 xe) + DeleteFakerAndAdd20Seeder (thêm 20 xe).
     */
    public function run(): void
    {
        // ── Admin user ──────────────────────────────────────────────────────
        User::create([
            'name'     => 'Admin BonBonCar',
            'email'    => 'admin@bonboncar.vn',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // ── Test customer ───────────────────────────────────────────────────
        User::create([
            'name'     => 'Nguyễn Văn A',
            'email'    => 'user@bonboncar.vn',
            'password' => Hash::make('password'),
            'role'     => 'customer',
        ]);

        // ── Seed 30 xe thực tế (RealCarSeeder) ──────────────────────────────
        // Tạo locations, features, và 30 xe thật với ảnh Unsplash
        $this->call(RealCarSeeder::class);

        // ── Thêm 20 xe thực tế nữa (DeleteFakerAndAdd20Seeder) ──────────────
        // Seeder này không xóa gì vì không có xe fake, chỉ thêm 20 xe mới
        $this->call(DeleteFakerAndAdd20Seeder::class);

        $this->command->info('');
        $this->command->info('🎉 Database seeded thành công!');
        $this->command->info('   Admin: admin@bonboncar.vn / password');
        $this->command->info('   User:  user@bonboncar.vn  / password');
        $this->command->info('   Tổng xe: ' . \App\Models\Car::count());
    }
}
