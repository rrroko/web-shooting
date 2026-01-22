<?php
$host = getenv('MYSQL_HOST') ?: 'mysql';
$db   = getenv('MYSQL_DB') ?: 'shooting_db';
$user = getenv('MYSQL_USER') ?: 'admin';
$pass = getenv('MYSQL_PASSWORD') ?: 'password';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  ]);
  echo "OK: Connected to $db as $user on $host";
} catch (Throwable $e) {
  http_response_code(500);
  echo "NG: ".$e->getMessage();
}
