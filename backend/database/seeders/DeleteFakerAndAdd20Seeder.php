<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use App\Models\Feature;
use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DeleteFakerAndAdd20Seeder extends Seeder
{
    public function run(): void
    {
        // NOTE: Đã bỏ logic xóa xe fake vì DatabaseSeeder không còn tạo xe fake nữa.

        // ── Step 2: Get existing locations & features ────────────────────
        $locations = Location::all();
        $features  = Feature::all();

        if ($locations->isEmpty() || $features->isEmpty()) {
            $this->command->error('No locations or features found! Run RealCarSeeder first.');
            return;
        }

        // ── Step 3: Image pool ───────────────────────────────────────────
        $imagePool = [
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
            'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80',
            'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80',
            'https://images.unsplash.com/photo-1502877338535-34cb0a4abac4?w=800&q=80',
            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
            'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
            'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
            'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
            'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
        ];

        // ── Step 4: 20 additional real cars ─────────────────────────────
        $newCars = [
            // Nissan
            ['brand' => 'Nissan',     'model' => 'Terra 2.5V 4WD',     'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Dầu',   'price' => 1_850_000,
             'desc' => 'SUV 7 chỗ gầm cao, mạnh mẽ với động cơ diesel, phù hợp cho cả địa hình off-road lẫn đường cao tốc dài. Khoang hành lý rộng rãi, ghế da cao cấp.'],

            ['brand' => 'Nissan',     'model' => 'Almera 1.0T Premium', 'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   770_000,
             'desc' => 'Sedan hạng C tiết kiệm nhiên liệu, thiết kế châu Âu hiện đại. Camera 360 độ, màn hình cảm ứng 8 inch, hỗ trợ Apple CarPlay/Android Auto.'],

            // Peugeot
            ['brand' => 'Peugeot',    'model' => '5008 1.6T',          'year' => 2022, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_980_000,
             'desc' => 'SUV 7 chỗ phong cách châu Âu sang trọng. Buồng lái i-Cockpit® độc đáo, màn hình HUD, hệ thống massage ghế, nội thất Nappa da cao cấp.'],

            ['brand' => 'Peugeot',    'model' => '3008 1.6T',          'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_750_000,
             'desc' => 'Crossover 5 chỗ đoạt nhiều giải thưởng thiết kế quốc tế. Hệ thống Active Safety Brake, Driving Assistance Plus, phanh khẩn cấp tự động.'],

            // Subaru
            ['brand' => 'Subaru',     'model' => 'Forester 2.0 EyeSight','year'=>2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_650_000,
             'desc' => 'SUV Nhật Bản với hệ thống AWD Symmetrical toàn thời gian, an toàn EyeSight® độc quyền (giám sát góc chết, phanh tự động, cảnh báo làn đường).'],

            // Volvo
            ['brand' => 'Volvo',      'model' => 'XC40 T4',            'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 2_400_000,
             'desc' => 'SUV nhỏ cao cấp thương hiệu Thụy Điển. An toàn hàng đầu với Pilot Assist, City Safety, cửa sổ trời toàn cảnh, âm thanh Harman Kardon.'],

            // Audi
            ['brand' => 'Audi',       'model' => 'Q5 45 TFSI',         'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 3_200_000,
             'desc' => 'SUV hạng sang Đức với quattro® AWD. Nội thất quattro® tinh tế, virtual cockpit, matrix LED headlights, điều hòa 4 vùng, âm thanh Bang & Olufsen.'],

            // BMW
            ['brand' => 'BMW',        'model' => '320i M Sport',       'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 2_800_000,
             'desc' => 'Sedan thể thao biểu tượng của BMW. Cảm giác lái Sheer Driving Pleasure huyền thoại, hệ thống iDrive 8.0, adaptive LED, phanh M Sport.'],

            // Mercedes-Benz
            ['brand' => 'Mercedes',   'model' => 'GLC 300 4MATIC',     'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 3_500_000,
             'desc' => 'SUV hạng sang đẳng cấp. Hệ thống MBUX thế hệ mới, cửa sổ trời Panoramic, ghế Nappa da, hệ thống treo Air Body Control, âm thanh Burmester®.'],

            // Lexus
            ['brand' => 'Lexus',      'model' => 'RX 350 Premium',     'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 3_800_000,
             'desc' => 'SUV hạng sang Nhật Bản đỉnh cao. Độ hoàn thiện vượt trội, nội thất Kiriko Glass, âm thanh Mark Levinson® Premium, hệ thống LSS+ an toàn.'],

            // Isuzu
            ['brand' => 'Isuzu',      'model' => 'D-Max 1.9 Ddi Blue Power','year'=>2023,'seats'=> 5, 'transmission' => 'Tự động', 'fuel' => 'Dầu',  'price' => 1_350_000,
             'desc' => 'Bán tải hạng trung đáng tin cậy. Động cơ diesel Blue Power tiết kiệm, sức kéo 3.5 tấn, thùng xe Dura-Spin mạ điện chống ăn mòn, camera 360°.'],

            // Chevrolet
            ['brand' => 'Chevrolet',  'model' => 'Colorado 2.5 LTZ',   'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Dầu',   'price' => 1_500_000,
             'desc' => 'Bán tải Mỹ mạnh mẽ với khả năng off-road ấn tượng. Khóa vi sai điện tử, hệ thống treo độc lập trước, cruise control, camera lùi độ phân giải cao.'],

            // Geely
            ['brand' => 'Geely',      'model' => 'Emgrand 1.5',        'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   680_000,
             'desc' => 'Sedan giá tốt thế hệ mới từ thương hiệu Trung Quốc đang lên. Thiết kế hiện đại, trang bị đầy đủ, ADAS level 2 an toàn, tiết kiệm nhiên liệu.'],

            ['brand' => 'Geely',      'model' => 'Coolray Sport',      'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   880_000,
             'desc' => 'Crossover đô thị trẻ trung, năng động. Phanh đĩa 4 bánh, cảm biến va chạm, màn hình 10.25 inch, camera 360°, sạc không dây Qi, Apple CarPlay.'],

            // MG
            ['brand' => 'MG',         'model' => 'ZS 1.5 Luxury',      'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   790_000,
             'desc' => 'SUV cỡ nhỏ giá trị cao, bảo hành 5 năm/150.000km. 6 túi khí, cân bằng điện tử, cảm biến áp suất lốp TPMS, màn hình Android 10.1 inch.'],

            ['brand' => 'MG',         'model' => 'HS 2.0T Trophy',     'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_150_000,
             'desc' => 'SUV cỡ trung trang bị đồng hồ kỹ thuật số 12.3 inch, màn hình HUD, tự đỗ xe thông minh, ghế da thêu chỉ vàng, hệ thống âm thanh Infinity Premium.'],

            // Volkswagen
            ['brand' => 'Volkswagen', 'model' => 'Tiguan Allspace',    'year' => 2022, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_990_000,
             'desc' => 'SUV 7 chỗ Đức chắc chắn, an toàn hàng đầu (5 sao Euro NCAP). Hệ thống 4MOTION AWD, Travel Assist (lái bán tự động), ghế hàng 3 gập phẳng hoàn toàn.'],

            // Mitsubishi (thêm)
            ['brand' => 'Mitsubishi', 'model' => 'Pajero Sport 2.4D',  'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Dầu',   'price' => 1_900_000,
             'desc' => 'SUV địa hình huyền thoại. Hệ thống Super Select 4WD-II, Hill Descent Control, địa hình 3 chế độ Gravel/Mud/Sand/Snow, bán kính vòng quay nhỏ 5.7m.'],

            // VinFast (thêm)
            ['brand' => 'VinFast',    'model' => 'VF e34 Premium',     'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Điện',  'price' =>   950_000,
             'desc' => 'Crossover điện thuần túy made-in-Vietnam. Tầm hoạt động 300km/sạc, sạc DC nhanh 0→80% trong 36 phút, ADAS đầy đủ, ứng dụng điều khiển xe từ xa.'],

            ['brand' => 'VinFast',    'model' => 'VF 6 Plus',          'year' => 2024, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Điện',  'price' =>   860_000,
             'desc' => 'SUV điện cỡ B thế hệ mới, thiết kế hiện đại. Pin LFP bền bỉ, bảo hành pin 10 năm, màn hình 12.9 inch, ADAS 6 camera, gương chiếu hậu thông minh.'],

            // Kia (thêm)
            ['brand' => 'Kia',        'model' => 'K3 Premium 2.0',     'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   870_000,
             'desc' => 'Sedan hạng C thiết kế Parametric Jewels ấn tượng. Màn hình 10.25 inch + HUD, ghế sưởi/thông gió, cửa sổ trời toàn cảnh, loa Bose 8 loa, 6 túi khí.'],
        ];

        $created = 0;
        foreach ($newCars as $carData) {
            $fullName = $carData['brand'] . ' ' . $carData['model'];
            $baseSlug = Str::slug($fullName);
            $slug     = $baseSlug . '-' . strtolower(Str::random(6));
            $location = $locations->random();

            $car = Car::create([
                'location_id'  => $location->id,
                'name'         => $fullName,
                'slug'         => $slug,
                'brand'        => $carData['brand'],
                'model'        => $carData['model'],
                'year'         => $carData['year'],
                'seats'        => $carData['seats'],
                'transmission' => $carData['transmission'],
                'fuel'         => $carData['fuel'],
                'price_per_day'=> $carData['price'],
                'status'       => 'available',
                'description'  => $carData['desc'],
            ]);

            // 3 images per car
            $shuffled = collect($imagePool)->shuffle()->take(3);
            foreach ($shuffled->values() as $idx => $imageUrl) {
                CarImage::create([
                    'car_id'    => $car->id,
                    'image_url' => $imageUrl,
                    'is_primary'=> $idx === 0,
                ]);
            }

            // 3–6 random features
            $car->features()->attach($features->random(rand(3, 6))->pluck('id'));
            $created++;
        }

        $this->command->info("✅ Added {$created} new real cars. Total cars: " . Car::count());
    }
}
