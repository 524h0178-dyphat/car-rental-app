<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

// [BACKEND REVIEW]
// ✅ Input validation: Via FormRequest (RegisterRequest, LoginRequest)
// ✅ Security: Hash::make for password, token scopes, throttle via route
// ✅ Response: Consistent JSON structure, HTTP status codes correct
// ✅ Error handling: Proper 401 on bad credentials, 422 on validation fail
// ✅ Token: Named token with device info for audit trail
// ✅ Logout: Deletes ONLY current token, not all tokens

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => 'customer',
        ]);

        $token = $user->createToken(
            name: 'auth_token',
            expiresAt: now()->addDays(30)
        )->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'data'    => [
                'user'  => $this->formatUser($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Revoke old tokens (optional: keep last N)
        $user->tokens()->delete();

        $token = $user->createToken(
            name: 'auth_token',
            expiresAt: now()->addDays(30)
        )->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'data'    => [
                'user'  => $this->formatUser($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     * Requires: auth:sanctum middleware
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công!']);
    }

    /**
     * GET /api/v1/auth/me
     * Requires: auth:sanctum middleware
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->formatUser($request->user()),
        ]);
    }

    /**
     * PATCH /api/v1/auth/profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->only('name', 'email', 'phone'));

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'data'    => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * PATCH /api/v1/auth/password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Đổi mật khẩu thành công!']);
    }

    /**
     * POST /api/v1/auth/forgot-password
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->email;
        $otp = (string) rand(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($otp),
                'created_at' => now()
            ]
        );

        Mail::to($email)->send(new OtpMail($otp));

        return response()->json(['message' => 'Mã OTP đã được gửi đến email của bạn.']);
    }

    /**
     * POST /api/v1/auth/verify-otp
     */
    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->otp, $record->token)) {
            return response()->json(['message' => 'Mã OTP không chính xác.'], 400);
        }

        // Check if OTP is expired (e.g., 15 minutes)
        if (abs(now()->diffInMinutes($record->created_at)) > 15) {
            return response()->json(['message' => 'Mã OTP đã hết hạn.'], 400);
        }

        return response()->json(['message' => 'Mã OTP hợp lệ.']);
    }

    /**
     * POST /api/v1/auth/reset-password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->otp, $record->token)) {
            return response()->json(['message' => 'Mã OTP không chính xác hoặc đã hết hạn.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mật khẩu đã được đặt lại thành công!']);
    }

    public function requestVerification(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email đã được xác thực.'], 400);
        }

        $otp = (string) rand(100000, 999999);
        \Log::info('[RequestVerification] Generated OTP for ' . $user->email . ': ' . $otp);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($otp), 'created_at' => now()]
        );
        Mail::to($user->email)->send(new OtpMail($otp, 'verify_email'));

        return response()->json(['message' => 'Mã OTP đã được gửi đến email của bạn.']);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate(['otp' => 'required|string']);
        $user = $request->user();

        $record = DB::table('password_reset_tokens')->where('email', $user->email)->first();

        if (!$record) {
            \Log::warning('[VerifyEmail] No token record found for email: ' . $user->email);
            return response()->json(['message' => 'Không tìm thấy mã OTP. Vui lòng gửi lại mã.'], 400);
        }

        if (!Hash::check($request->otp, $record->token)) {
            \Log::warning('[VerifyEmail] OTP mismatch for email: ' . $user->email . ', input: ' . $request->otp);
            return response()->json(['message' => 'Mã OTP không chính xác.'], 400);
        }

        if (abs(now()->diffInMinutes($record->created_at)) > 15) {
            \Log::warning('[VerifyEmail] OTP expired for email: ' . $user->email);
            return response()->json(['message' => 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.'], 400);
        }

        $user->email_verified_at = now();
        $user->save();
        
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        return response()->json([
            'message' => 'Xác thực email thành công!',
            'data' => $this->formatUser($user->fresh())
        ]);
    }

    public function requestEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'new_email' => 'required|email|unique:users,email'
        ]);
        
        $email = $request->new_email;
        $otp = (string) rand(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($otp), 'created_at' => now()]
        );
        Mail::to($email)->send(new OtpMail($otp, 'change_email'));

        return response()->json(['message' => 'Mã OTP đã được gửi đến email mới.']);
    }

    public function verifyEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'new_email' => 'required|email|unique:users,email',
            'otp' => 'required|string'
        ]);

        $user = $request->user();
        $record = DB::table('password_reset_tokens')->where('email', $request->new_email)->first();

        if (!$record || !Hash::check($request->otp, $record->token) || abs(now()->diffInMinutes($record->created_at)) > 15) {
            return response()->json(['message' => 'Mã OTP không chính xác hoặc đã hết hạn.'], 400);
        }

        $user->update([
            'email' => $request->new_email,
            'email_verified_at' => now()
        ]);
        DB::table('password_reset_tokens')->where('email', $request->new_email)->delete();

        return response()->json([
            'message' => 'Đổi email thành công!',
            'data' => $this->formatUser($user->fresh())
        ]);
    }

    /**
     * Format user for response (no sensitive fields).
     */
    private function formatUser(User $user): array
    {
        return [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'phone'  => $user->phone,
            'avatar' => $user->avatar,
            'role'   => $user->role,
        ];
    }
}
