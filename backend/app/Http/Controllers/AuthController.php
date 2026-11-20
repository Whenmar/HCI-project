<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller {
    public function register(Request $request) {
        $data = $request->validate(['name'=>'required|string|max:120','email'=>'required|email|max:190|unique:users,email','password'=>'required|string|min:8']);
        $user = User::create([...$data, 'role'=>'customer']);
        return response()->json(['user'=>$user, 'token'=>$user->createToken('cordova-web')->plainTextToken], 201);
    }
    public function login(Request $request) {
        $data = $request->validate(['email'=>'required|email','password'=>'required|string']);
        $user = User::where('email',$data['email'])->first();
        if (!$user || !Hash::check($data['password'],$user->password)) {
            throw ValidationException::withMessages(['email'=>['The supplied credentials are incorrect.']]);
        }
        return response()->json(['user'=>$user,'token'=>$user->createToken('cordova-web')->plainTextToken]);
    }
    public function logout(Request $request) { $request->user()->currentAccessToken()?->delete(); return response()->json(['message'=>'Signed out']); }
    public function me(Request $request) { return response()->json(['user'=>$request->user()]); }
    public function customers() { return response()->json(User::select('id','name','email','role','created_at')->latest()->get()); }
}
