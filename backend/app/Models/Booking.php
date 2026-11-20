<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Booking extends Model {
    protected $fillable = ['customer_id','bike_id','start_at','end_at','total_amount','status','payment_status','customer_name','customer_email'];
    protected function casts(): array { return ['start_at'=>'datetime','end_at'=>'datetime','total_amount'=>'decimal:2']; }
    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function bike() { return $this->belongsTo(Bike::class); }
    public function payments() { return $this->hasMany(Payment::class); }
}
