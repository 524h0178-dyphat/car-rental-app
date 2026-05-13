<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * GET /api/v1/admin/users
     * List all non-admin users with optional search.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::where('role', 'customer')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($q2) use ($request) {
                    $q2->where('name', 'like', "%{$request->search}%")
                       ->orWhere('email', 'like', "%{$request->search}%")
                       ->orWhere('phone', 'like', "%{$request->search}%");
                });
            })
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $users->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'phone'      => $u->phone,
                'role'       => $u->role,
                'status'     => $u->status,
                'created_at' => $u->created_at?->toDateTimeString(),
            ]),
            'meta' => [
                'total'        => $users->total(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/admin/users/{id}/status
     * Block or unblock a user.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,blocked'],
        ]);

        $user = User::where('role', 'customer')->findOrFail($id);
        $user->update(['status' => $request->status]);

        return response()->json([
            'message' => $request->status === 'blocked'
                ? 'Đã khóa tài khoản người dùng.'
                : 'Đã mở khóa tài khoản người dùng.',
            'data' => [
                'id'     => $user->id,
                'status' => $user->status,
            ],
        ]);
    }
}
