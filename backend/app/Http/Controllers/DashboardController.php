<?php
namespace App\Http\Controllers;
use App\Models\Bike;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
class DashboardController extends Controller {
    public function index() {
        return response()->json([
            'bikes'=>Bike::count(),
            'bookings'=>Booking::count(),
            'revenue'=>(float) Payment::where('status','paid')->sum('amount'),
            'customers'=>User::where('role','customer')->count(),
            'available_bikes'=>Bike::where('status','available')->count(),
            'pending_bookings'=>Booking::where('status','pending')->count(),
        ]);
    }
}
