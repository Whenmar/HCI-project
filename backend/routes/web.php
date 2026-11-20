<?php
use Illuminate\Support\Facades\Route;
Route::get('/', fn () => response()->json(['app' => 'Cordova Bike Rental API', 'status' => 'ok']));
