<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\CarSubmission;

foreach(CarSubmission::all() as $s) {
    echo "ID: {$s->id}, Status: {$s->status}, CarID: {$s->car_id}, UserID: {$s->user_id}\n";
}
