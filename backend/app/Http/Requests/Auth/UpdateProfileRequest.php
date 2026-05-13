<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $rules = [
            'name'  => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
        ];

        if (!$this->user()->email_verified_at) {
            $rules['email'] = [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Vui lòng nhập họ tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.unique'   => 'Email này đã được sử dụng.',
            'phone.regex'    => 'Số điện thoại không hợp lệ.',
        ];
    }
}
