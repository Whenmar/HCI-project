<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void { Schema::create('bikes', function (Blueprint $table) {
        $table->id(); $table->string('name'); $table->string('type'); $table->text('description')->nullable();
        $table->decimal('price_per_hour',10,2); $table->string('status')->default('available'); $table->text('image_url')->nullable(); $table->timestamps();
    }); }
    public function down(): void { Schema::dropIfExists('bikes'); }
};
