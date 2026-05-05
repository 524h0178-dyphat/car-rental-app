<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use App\Models\Feature;
use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RealCarSeeder extends Seeder
{
    /**
     * Seed 30 realistic car entries with proper Vietnamese car market data.
     * Images sourced from Unsplash (free, no API key needed).
     */
    public function run(): void
    {
        // ── Ensure locations exist ──────────────────────────────────────────
        $locMap = [
            'Hồ Chí Minh' => ['Quận 1', 'Quận 7', 'Tân Bình', 'Bình Thạnh', 'Thủ Đức'],
            'Hà Nội'       => ['Cầu Giấy', 'Đống Đa', 'Ba Đình', 'Hoàng Mai'],
            'Đà Nẵng'      => ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn'],
            'Đà Lạt'       => ['Phường 1', 'Phường 4'],
            'Nha Trang'    => ['Lộc Thọ', 'Vĩnh Hải'],
        ];

        $locations = [];
        foreach ($locMap as $province => $districts) {
            foreach ($districts as $district) {
                $loc = Location::firstOrCreate(
                    ['name' => $district, 'province' => $province],
                    ['name' => $district, 'province' => $province]
                );
                $locations[] = $loc;
            }
        }

        // ── Ensure features exist ────────────────────────────────────────────
        $featureDefs = [
            ['name' => 'Bản đồ',          'icon' => 'map'],
            ['name' => 'Bluetooth',        'icon' => 'bluetooth'],
            ['name' => 'Camera lùi',       'icon' => 'camera'],
            ['name' => 'Cảm biến lùi',    'icon' => 'radar'],
            ['name' => 'GPS',              'icon' => 'navigation'],
            ['name' => 'Cửa sổ trời',     'icon' => 'sun'],
            ['name' => 'Ghế da',          'icon' => 'armchair'],
            ['name' => 'Màn hình cảm ứng','icon' => 'monitor'],
            ['name' => 'Sạc không dây',   'icon' => 'zap'],
            ['name' => 'Túi khí 6 cái',  'icon' => 'shield'],
        ];

        $features = [];
        foreach ($featureDefs as $def) {
            $features[] = Feature::firstOrCreate(['name' => $def['name']], $def);
        }

        // ── Car image pool (Unsplash – varied car angles & brands) ───────────
        $imagePool = [
            // Sedans / SUVs
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

        // ── 30 realistic cars ────────────────────────────────────────────────
        $cars = [
            // ── Toyota ──
            ['brand' => 'Toyota', 'model' => 'Camry 2.5Q',     'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_350_000],
            ['brand' => 'Toyota', 'model' => 'Fortuner 2.7V',  'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_800_000],
            ['brand' => 'Toyota', 'model' => 'Vios 1.5G',      'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   750_000],
            ['brand' => 'Toyota', 'model' => 'Innova 2.0E',    'year' => 2022, 'seats' => 7, 'transmission' => 'Số sàn',  'fuel' => 'Xăng',  'price' =>   950_000],
            ['brand' => 'Toyota', 'model' => 'Corolla Cross',  'year' => 2024, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Hybrid', 'price' => 1_500_000],
            ['brand' => 'Toyota', 'model' => 'Rush 1.5S',      'year' => 2021, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   880_000],
            // ── Honda ──
            ['brand' => 'Honda',  'model' => 'City RS 1.5',    'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   820_000],
            ['brand' => 'Honda',  'model' => 'CR-V L',         'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_650_000],
            ['brand' => 'Honda',  'model' => 'Civic RS',       'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_100_000],
            ['brand' => 'Honda',  'model' => 'BR-V G',         'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   990_000],
            // ── Hyundai ──
            ['brand' => 'Hyundai','model' => 'Tucson 2.0',     'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_400_000],
            ['brand' => 'Hyundai','model' => 'Accent 1.4',     'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   720_000],
            ['brand' => 'Hyundai','model' => 'Santa Fe 2.2D',  'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Dầu',   'price' => 1_950_000],
            ['brand' => 'Hyundai','model' => 'i10 Grand',      'year' => 2022, 'seats' => 4, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   550_000],
            // ── Kia ──
            ['brand' => 'Kia',    'model' => 'Seltos 1.4T',    'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_200_000],
            ['brand' => 'Kia',    'model' => 'Carnival Luxury', 'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 2_200_000],
            ['brand' => 'Kia',    'model' => 'Morning LX',     'year' => 2022, 'seats' => 4, 'transmission' => 'Số sàn',  'fuel' => 'Xăng',  'price' =>   520_000],
            ['brand' => 'Kia',    'model' => 'Sorento 2.2D',   'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Dầu',   'price' => 1_750_000],
            // ── Mazda ──
            ['brand' => 'Mazda',  'model' => 'CX-5 2.0 Luxury','year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_600_000],
            ['brand' => 'Mazda',  'model' => 'Mazda3 1.5L',    'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   990_000],
            ['brand' => 'Mazda',  'model' => 'CX-8 2.5T AWD',  'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 2_100_000],
            // ── Ford ──
            ['brand' => 'Ford',   'model' => 'Ranger XLT 2.0', 'year' => 2022, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Dầu',   'price' => 1_450_000],
            ['brand' => 'Ford',   'model' => 'Territory Trend','year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' => 1_300_000],
            ['brand' => 'Ford',   'model' => 'EcoSport ST-Line','year' => 2021, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   800_000],
            // ── VinFast ──
            ['brand' => 'VinFast','model' => 'VF 8 Plus',      'year' => 2024, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Điện',  'price' => 1_700_000],
            ['brand' => 'VinFast','model' => 'VF 9 Eco',       'year' => 2024, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Điện',  'price' => 2_300_000],
            ['brand' => 'VinFast','model' => 'VF 5 Plus',      'year' => 2023, 'seats' => 5, 'transmission' => 'Tự động', 'fuel' => 'Điện',  'price' =>   780_000],
            // ── Mitsubishi ──
            ['brand' => 'Mitsubishi','model' => 'Xpander 1.5',  'year' => 2023, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng', 'price' =>   980_000],
            ['brand' => 'Mitsubishi','model' => 'Outlander 2.0','year' => 2022, 'seats' => 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng', 'price' => 1_350_000],
            // ── Suzuki ──
            ['brand' => 'Suzuki', 'model' => 'Ertiga 1.5 Premium','year'=> 2022,'seats'=> 7, 'transmission' => 'Tự động', 'fuel' => 'Xăng',  'price' =>   840_000],
        ];

        $descriptions = [
            'Xe đời mới, bảo dưỡng đúng chu kỳ, luôn sạch sẽ và sẵn sàng phục vụ. Tiết kiệm nhiên liệu, nội thất sang trọng với đầy đủ tiện nghi hiện đại.',
            'Xe gia đình rộng rãi, phù hợp cho cả chuyến đi ngắn lẫn hành trình dài. Gầm xe cao, khả năng vận hành tốt trên nhiều địa hình.',
            'Mẫu xe cỡ nhỏ tiện lợi, dễ đậu đỗ trong nội đô. Tiết kiệm nhiên liệu tối ưu, lý tưởng cho di chuyển hàng ngày.',
            'SUV cao cấp với công nghệ an toàn tiên tiến. Không gian nội thất rộng rãi, hệ thống giải trí đỉnh cao, phù hợp cho mọi hành trình.',
            'Xe điện thế hệ mới, không phát thải, vận hành êm ái. Sạc nhanh DC, tầm hoạt động xa, hỗ trợ lái xe bán tự động.',
        ];

        foreach ($cars as $carData) {
            $fullName = $carData['brand'] . ' ' . $carData['model'];
            $baseSlug = Str::slug($fullName);
            $slug     = $baseSlug . '-' . strtolower(Str::random(6));

            $location = $locations[array_rand($locations)];

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
                'description'  => $descriptions[array_rand($descriptions)],
            ]);

            // 3 images per car (first is primary)
            $shuffled = collect($imagePool)->shuffle()->take(3);
            foreach ($shuffled->values() as $idx => $imageUrl) {
                CarImage::create([
                    'car_id'    => $car->id,
                    'image_url' => $imageUrl,
                    'is_primary'=> $idx === 0,
                ]);
            }

            // 3–6 random features
            $randomFeatures = collect($features)->random(rand(3, 6))->pluck('id');
            $car->features()->attach($randomFeatures);
        }

        $this->command->info('✅ Seeded 30 real car entries successfully.');
    }
}
