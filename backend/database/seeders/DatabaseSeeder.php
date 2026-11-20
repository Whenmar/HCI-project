<?php
namespace Database\Seeders;
use App\Models\User;
use App\Models\Bike;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        User::updateOrCreate(['email'=>'admin@cordova.test'],[
            'name'=>'Cordova Administrator','password'=>Hash::make('Password123!'),'role'=>'admin'
        ]);
        $bikes = [
            ['name'=>'Coastal Explorer','type'=>'Mountain Bike','description'=>'Comfortable all-terrain bike for coastal routes.','price_per_hour'=>120,'status'=>'available'],
            ['name'=>'Island Cruiser','type'=>'City Bike','description'=>'Relaxed ride for town trips and scenic stops.','price_per_hour'=>90,'status'=>'available'],
            ['name'=>'Road Runner','type'=>'Road Bike','description'=>'Lightweight frame for longer rides.','price_per_hour'=>150,'status'=>'available'],
            ['name'=>'Little Adventurer','type'=>'Kids Bike','description'=>'A smaller bike for younger riders.','price_per_hour'=>70,'status'=>'maintenance'],
            ['name'=>'Easy Fold','type'=>'Folding Bike','description'=>'Compact bike for easy storage and short rides.','price_per_hour'=>100,'status'=>'available'],
            ['name'=>'Eco Glide','type'=>'Electric Bike','description'=>'Electric-assist ride for a little extra help.','price_per_hour'=>220,'status'=>'available']
        ];
        foreach ($bikes as $bike) Bike::updateOrCreate(['name'=>$bike['name']],$bike);
    }
}
