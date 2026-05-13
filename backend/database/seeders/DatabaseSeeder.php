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
        User::firstOrCreate(
            ['email'    => 'admin@skibidicar.vn'],
            [
                'name'     => 'Admin SkibidiCar',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // ── Test customer ───────────────────────────────────────────────────
        User::firstOrCreate(
            ['email'    => 'user@skibidicar.vn'],
            [
                'name'     => 'Nguyễn Văn A',
                'password' => Hash::make('password'),
                'role'     => 'customer',
            ]
        );

        // ── Seed 30 xe thực tế (RealCarSeeder) ──────────────────────────────
        $this->call(RealCarSeeder::class);

        // ── Thêm 20 xe thực tế nữa (DeleteFakerAndAdd20Seeder) ──────────────
        $this->call(DeleteFakerAndAdd20Seeder::class);

        $this->command->info('');
        $this->command->info('🎉 Database seeded thành công!');
        $this->command->info('   Admin: admin@skibidicar.vn / password');
        $this->command->info('   User:  user@skibidicar.vn  / password');
        $this->command->info('   Tổng xe: ' . \App\Models\Car::count());
    }
}
