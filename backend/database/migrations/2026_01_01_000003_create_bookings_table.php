<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void { Schema::create('bookings', function (Blueprint $table) {
        $table->id(); $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
        $table->foreignId('bike_id')->constrained('bikes')->restrictOnDelete();
        $table->dateTime('start_at'); $table->dateTime('end_at'); $table->decimal('total_amount',10,2);
        $table->string('status')->default('pending'); $table->string('payment_status')->default('unpaid');
        $table->string('customer_name'); $table->string('customer_email'); $table->timestamps();
        $table->index(['bike_id','start_at','end_at']);
    }); }
    public function down(): void { Schema::dropIfExists('bookings'); }
};
