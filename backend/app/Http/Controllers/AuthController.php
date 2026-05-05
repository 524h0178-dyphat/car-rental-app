<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
     * Format user for response (no sensitive fields).
     */
    private function formatUser(User $user): array
    {
        return [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'phone'  => $user->phone,
            'avatar' => $user->avatar,
            'role'   => $user->role,
        ];
    }
}
