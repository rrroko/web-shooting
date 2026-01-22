<?php
require __DIR__ . '/_bootstrap.php';
$in = json_input();
$player_name = trim((string)($in['player_name'] ?? ''));
$password    = (string)($in['password'] ?? '');

if (!preg_match('/^[A-Za-z0-9_-]{3,16}$/', $player_name)) {
  respond(['ok'=>false, 'error'=>'invalid_player_name'], 400);
}
if (strlen($password) < 6 || strlen($password) > 64) {
  respond(['ok'=>false, 'error'=>'invalid_password_length'], 400);
}

$player_name_lower = mb_strtolower($player_name, 'UTF-8');
$st = $pdo->prepare("SELECT id FROM players WHERE player_name_lower = ?");
$st->execute([$player_name_lower]);
if ($st->fetch()) respond(['ok'=>false, 'error'=>'player_name_taken'], 409);

$hash = password_hash($password, PASSWORD_DEFAULT);
$pdo->beginTransaction();
try {
  $pdo->prepare("INSERT INTO players (player_name, player_name_lower, password_hash) VALUES (?,?,?)")
      ->execute([$player_name, $player_name_lower, $hash]);
  $player_id = (int)$pdo->lastInsertId();

  $pdo->prepare("INSERT INTO progress (player_id) VALUES (?)")->execute([$player_id]);
  $pdo->prepare("INSERT INTO inventory (player_id) VALUES (?)")->execute([$player_id]);

  $token = bin2hex(random_bytes(32));
  $pdo->prepare("INSERT INTO sessions (player_id, token, ip_hash, ua_hash) VALUES (?,?,?,?)")
      ->execute([$player_id, $token, hash_text($_SERVER['REMOTE_ADDR'] ?? ''), hash_text($_SERVER['HTTP_USER_AGENT'] ?? '')]);
  $pdo->commit();

  set_sid_cookie($token);
  respond(['ok'=>true, 'player_id'=>$player_id, 'player_name'=>$player_name]);
} catch (Throwable $e) {
  $pdo->rollBack();
  respond(['ok'=>false, 'error'=>'registration_failed', 'message'=>$e->getMessage()], 500);
}
