<?php
namespace App\Http\Controllers;
use App\Models\Bike;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
class BikeController extends Controller {
    public function index() { return response()->json(Bike::latest()->get()); }
    public function store(Request $request) {
        $data = $request->validate(['name'=>'required|string|max:150','type'=>'required|string|max:80','description'=>'nullable|string|max:2000','price_per_hour'=>'required|numeric|min:1','status'=>['required',Rule::in(['available','maintenance','unavailable'])],'image_url'=>'nullable|url|max:2000']);
        return response()->json(Bike::create($data),201);
    }
    public function show(Bike $bike) { return response()->json($bike); }
    public function update(Request $request, Bike $bike) {
        $data = $request->validate(['name'=>'required|string|max:150','type'=>'required|string|max:80','description'=>'nullable|string|max:2000','price_per_hour'=>'required|numeric|min:1','status'=>['required',Rule::in(['available','maintenance','unavailable'])],'image_url'=>'nullable|url|max:2000']);
        $bike->update($data); return response()->json($bike);
    }
    public function destroy(Bike $bike) {
        if ($bike->bookings()->whereIn('status',['pending','confirmed','ongoing'])->exists()) return response()->json(['message'=>'Cannot delete a bike with active bookings.'],422);
        $bike->delete(); return response()->json(['message'=>'Bike deleted']);
    }
}
