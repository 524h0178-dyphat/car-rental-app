<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tạo một số người dùng mẫu để viết đánh giá
        $users = [];
        $names = [
            'Trần Thanh Sơn', 'Nguyễn Thị Mai', 'Lê Hoàng Nam', 
            'Phạm Thu Thảo', 'Hoàng Gia Bảo', 'Vũ Tuyết Mai',
            'Đặng Đình Toàn', 'Bùi Minh Tuấn', 'Ngô Phương Thảo'
        ];

        foreach ($names as $i => $name) {
            $users[] = User::firstOrCreate(
                ['email' => "reviewer{$i}@example.com"],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => 'customer',
                ]
            );
        }

        // 2. Lấy tất cả các xe hiện có (được coi là xe hệ thống)
        $cars = Car::all();

        $comments = [
            5 => [
                'Xe rất sạch sẽ, đi êm, đúng như mô tả. Chủ xe nhiệt tình.',
                'Dịch vụ tuyệt vời! Xe mới và thơm tho. Chắc chắn sẽ ủng hộ lại.',
                'Xe chạy rất bốc, tiết kiệm nhiên liệu. Giao xe đúng giờ.',
                'Trải nghiệm tuyệt vời. Xe được bảo dưỡng tốt, nội thất sạch sẽ.',
                'Chủ xe rất thân thiện và hỗ trợ nhiệt tình. Xe đi rất thích.'
            ],
            4 => [
                'Xe ổn, đi tốt nhưng hơi hao xăng một chút.',
                'Giao xe hơi trễ 5 phút nhưng bù lại xe rất sạch và mới.',
                'Xe chạy êm, máy lạnh mát sâu. Giá hơi cao tí nhưng đáng tiền.',
                'Nói chung là hài lòng. Xe đi gia đình rất hợp.',
                'Chất lượng xe tốt, thủ tục nhận xe nhanh gọn.'
            ],
            3 => [
                'Xe hơi cũ nhưng vẫn chạy tốt. Chấp nhận được với tầm giá.',
                'Máy lạnh hơi yếu lúc mới bật. Còn lại ok.',
                'Xe đi tạm được, không có gì nổi bật.'
            ]
        ];

        // 3. Tạo đánh giá cho từng xe
        foreach ($cars as $car) {
            // Mỗi xe tạo từ 3 đến 8 đánh giá
            $numReviews = rand(3, 8);
            
            // Xáo trộn mảng user để các xe có người đánh giá ngẫu nhiên
            $shuffledUsers = $users;
            shuffle($shuffledUsers);
            
            for ($i = 0; $i < $numReviews; $i++) {
                if ($i >= count($shuffledUsers)) break; // Không đủ user thì dừng
                
                $user = $shuffledUsers[$i];
                
                // Tỷ lệ: 5 sao (50%), 4 sao (40%), 3 sao (10%)
                $rand = rand(1, 10);
                if ($rand <= 5) {
                    $rating = 5;
                } elseif ($rand <= 9) {
                    $rating = 4;
                } else {
                    $rating = 3;
                }
                
                $commentList = $comments[$rating];
                $comment = $commentList[array_rand($commentList)];
                
                // Tạo đơn hàng hoàn thành giả lập
                $startDate = now()->subDays(rand(10, 40));
                $endDate = (clone $startDate)->addDays(rand(1, 5));
                
                $booking = \App\Models\Booking::create([
                    'user_id' => $user->id,
                    'car_id' => $car->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'total_days' => 3,
                    'price_per_day' => $car->price_per_day ?? 500000,
                    'total_price' => ($car->price_per_day ?? 500000) * 3,
                    'status' => 'completed',
                    'payment_status' => 'paid',
                    'payment_method' => 'bank_transfer',
                    'renter_name' => $user->name,
                    'renter_phone' => '0901234567',
                    'renter_cccd' => '012345678901',
                    'renter_license' => 'GPLX123456',
                ]);
                
                Review::create([
                    'booking_id' => $booking->id,
                    'car_id' => $car->id,
                    'user_id' => $user->id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'status' => 'visible',
                    'created_at' => $endDate->addHours(rand(1, 24)), // Đánh giá sau khi trả xe
                ]);
            }
        }
    }
}
