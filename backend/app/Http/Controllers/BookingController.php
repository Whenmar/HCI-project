<?php
namespace App\Http\Controllers;
use App\Models\Bike;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;
class BookingController extends Controller {
    public function index() { return response()->json(Booking::with(['bike','customer:id,name,email'])->latest()->get()); }
    public function store(Request $request) {
        $data = $request->validate([
            'bike_id'=>'required|exists:bikes,id','start_at'=>'required|date|after_or_equal:now','end_at'=>'required|date|after:start_at',
            'customer_name'=>'required|string|max:120','customer_email'=>'required|email|max:190'
        ]);
        $bike = Bike::findOrFail($data['bike_id']);
        if ($bike->status !== 'available') return response()->json(['message'=>'This bike is not available.'],422);
        $start = Carbon::parse($data['start_at']); $end = Carbon::parse($data['end_at']);
        $overlap = Booking::where('bike_id',$bike->id)->whereIn('status',['pending','confirmed','ongoing'])
            ->where('start_at','<',$end)->where('end_at','>',$start)->exists();
        if ($overlap) return response()->json(['message'=>'This bike already has a booking during that time.'],422);
        $hours = max(1, (int) ceil($start->diffInMinutes($end)/60));
        $booking = Booking::create([
            'customer_id'=>$request->user()->id,'bike_id'=>$bike->id,'start_at'=>$start,'end_at'=>$end,
            'total_amount'=>$hours * $bike->price_per_hour,'status'=>'pending','payment_status'=>'unpaid',
            'customer_name'=>$data['customer_name'],'customer_email'=>$data['customer_email']
        ]);
        return response()->json($booking->load(['bike','customer:id,name,email']),201);
    }
    public function updateStatus(Request $request, Booking $booking) {
        $data = $request->validate(['status'=>['required',Rule::in(['pending','confirmed','ongoing','completed','cancelled'])]]);
        $booking->update($data);
        return response()->json($booking->load(['bike','customer:id,name,email']));
    }
}
