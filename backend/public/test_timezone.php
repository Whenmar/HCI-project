
<?php

date_default_timezone_set('Asia/Manila');

echo "<h2>Bike Rental System - Timezone Test</h2>";

echo "PHP Timezone: " . date_default_timezone_get() . "<br>";

echo "Current Philippine Date & Time: " . date('Y-m-d H:i:s') . "<br>";

echo "Current Date: " . date('Y-m-d') . "<br>";

echo "Current Time: " . date('H:i:s') . "<br>";

?>
