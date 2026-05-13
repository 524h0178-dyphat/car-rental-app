<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0]
        );

        $transactions = $wallet->transactions()->latest()->paginate(10);

        return response()->json([
            'data' => [
                'balance' => $wallet->balance,
                'transactions' => $transactions->items(),
                'meta' => [
                    'total' => $transactions->total(),
                    'last_page' => $transactions->lastPage(),
                    'current_page' => $transactions->currentPage(),
                ],
            ]
        ]);
    }
}
