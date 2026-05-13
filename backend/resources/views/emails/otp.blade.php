<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mã xác nhận quên mật khẩu</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; line-height: 1.6; color: #334155;">
    <div style="max-w-md; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        @php
            $title = 'Khôi phục mật khẩu';
            $desc = 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SkibidiCar của bạn. Vui lòng sử dụng mã xác nhận bên dưới để tiếp tục:';
            if ($type === 'verify_email') {
                $title = 'Xác nhận email';
                $desc = 'Cảm ơn bạn đã đăng ký tài khoản SkibidiCar. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất việc xác thực email của bạn:';
            } elseif ($type === 'change_email') {
                $title = 'Đổi địa chỉ email';
                $desc = 'Chúng tôi nhận được yêu cầu thay đổi địa chỉ email cho tài khoản của bạn. Vui lòng sử dụng mã xác nhận bên dưới để tiếp tục:';
            }
        @endphp
        <h2 style="color: #0f172a; text-align: center; margin-bottom: 20px;">{{ $title }}</h2>
        <p>Xin chào,</p>
        <p>{{ $desc }}</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; background-color: #eff6ff; padding: 15px 30px; border-radius: 8px; border: 1px solid #bfdbfe;">
                {{ $otp }}
            </span>
        </div>

        <p style="font-size: 14px; color: #64748b;">Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua email này.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            <p>&copy; {{ date('Y') }} SkibidiCar. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
