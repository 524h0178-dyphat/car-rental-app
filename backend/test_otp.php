<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$email = 'nguyenhuunghiaiter@gmail.com';
$user = User::where('email', $email)->first();

if ($user) {
    echo "User found:\n";
    echo "Email: " . $user->email . "\n";
    echo "Role: " . $user->role . "\n";
    echo "Verified At: " . $user->email_verified_at . "\n";
} else {
    echo "No user found for $email\n";
}
