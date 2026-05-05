<?php

namespace App\Http\Requests\CarSubmission;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarSubmissionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'owner_name'              => ['required', 'string', 'max:100'],
            'owner_phone'             => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'owner_email'             => ['required', 'email', 'max:255'],
            'owner_cccd'              => ['required', 'string', 'min:9', 'max:20'],
            'owner_address'           => ['nullable', 'string', 'max:255'],
            'brand'                   => ['required', 'string', 'max:60'],
            'model'                   => ['required', 'string', 'max:100'],
            'year'                    => ['required', 'integer', 'min:2010', 'max:' . (date('Y') + 1)],
            'license_plate'           => ['required', 'string', 'max:20'],
            'transmission'            => ['required', 'in:Số tự động,Số sàn'],
            'fuel'                    => ['required', 'in:Xăng,Dầu,Điện,Hybrid'],
            'seats'                   => ['required', 'integer', 'in:4,5,7,9'],
            'expected_price_per_day'  => ['required', 'integer', 'min:100000'],
            'location_province'       => ['required', 'string', 'max:100'],
            'description'             => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'owner_name.required'             => 'Vui lòng nhập họ tên chủ xe.',
            'owner_phone.required'            => 'Vui lòng nhập số điện thoại.',
            'owner_email.required'            => 'Vui lòng nhập email.',
            'owner_cccd.required'             => 'Vui lòng nhập số CCCD.',
            'brand.required'                  => 'Vui lòng nhập hãng xe.',
            'model.required'                  => 'Vui lòng nhập mẫu xe.',
            'year.required'                   => 'Vui lòng nhập năm sản xuất.',
            'year.min'                        => 'Xe sản xuất từ năm 2010 trở lên.',
            'license_plate.required'          => 'Vui lòng nhập biển số xe.',
            'transmission.required'           => 'Vui lòng chọn hộp số.',
            'fuel.required'                   => 'Vui lòng chọn loại nhiên liệu.',
            'seats.required'                  => 'Vui lòng chọn số chỗ ngồi.',
            'seats.in'                        => 'Số chỗ ngồi phải là 4, 5, 7 hoặc 9.',
            'expected_price_per_day.required' => 'Vui lòng nhập giá kỳ vọng.',
            'expected_price_per_day.min'      => 'Giá tối thiểu là 100.000₫/ngày.',
            'location_province.required'      => 'Vui lòng chọn tỉnh/thành phố.',
        ];
    }
}
