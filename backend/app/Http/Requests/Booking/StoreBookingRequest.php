<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Auth checked by route middleware
    }

    public function rules(): array
    {
        return [
            'car_id'         => ['required', 'integer', 'exists:cars,id'],
            'start_date'     => ['required', 'date', 'after_or_equal:today'],
            'end_date'       => ['required', 'date', 'after:start_date'],
            'renter_name'    => ['required', 'string', 'max:100'],
            'renter_phone'   => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'renter_cccd'    => ['required', 'string', 'min:9', 'max:20'],
            'renter_license' => ['nullable', 'string', 'max:30'],
            'pickup_address' => ['nullable', 'string', 'max:255'],
            'pickup_note'    => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'in:bank_transfer,cash,momo'],
            'note'           => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'car_id.required'       => 'Vui lòng chọn xe.',
            'car_id.exists'         => 'Xe không tồn tại.',
            'start_date.required'   => 'Vui lòng chọn ngày nhận xe.',
            'start_date.after_or_equal' => 'Ngày nhận xe phải từ hôm nay trở đi.',
            'end_date.required'     => 'Vui lòng chọn ngày trả xe.',
            'end_date.after'        => 'Ngày trả xe phải sau ngày nhận xe.',
            'renter_name.required'  => 'Vui lòng nhập họ tên.',
            'renter_phone.required' => 'Vui lòng nhập số điện thoại.',
            'renter_phone.regex'    => 'Số điện thoại không hợp lệ.',
            'renter_cccd.required'  => 'Vui lòng nhập số CCCD.',
            'renter_cccd.min'       => 'CCCD phải có ít nhất 9 ký tự.',
            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán.',
            'payment_method.in'     => 'Phương thức thanh toán không hợp lệ.',
        ];
    }
}
