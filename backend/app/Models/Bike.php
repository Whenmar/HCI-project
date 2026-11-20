<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Bike extends Model {
    protected $fillable = ['name','type','description','price_per_hour','status','image_url'];
    protected function casts(): array { return ['price_per_hour'=>'decimal:2']; }
    public function bookings() { return $this->hasMany(Booking::class); }
}
