<?php
namespace Tests\Feature;
use Tests\TestCase;
class ApiSmokeTest extends TestCase {
    public function test_health_route_returns_ok(): void {
        $this->get('/')->assertOk()->assertJson(['status'=>'ok']);
    }
}
