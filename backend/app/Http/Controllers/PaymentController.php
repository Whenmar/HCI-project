<?php
namespace App\Http\Controllers;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
class PaymentController extends Controller {
    public function index() { return response()->json(Payment::latest()->get()); }
    public function store(Request $request) {
        $data = $request->validate([
            'booking_id'=>'required|exists:bookings,id','amount'=>'required|numeric|min:0.01',
            'method'=>['required',Rule::in(['Cash','GCash (manual record)','Bank transfer','Card (manual record)'])],
            'reference'=>'nullable|string|max:190'
        ]);
        $booking = Booking::findOrFail($data['booking_id']);
        $payment = Payment::create([...$data,'status'=>'paid','recorded_by'=>$request->user()->id]);
        $booking->update(['payment_status'=>'paid']);
        return response()->json($payment,201);
    }
}
