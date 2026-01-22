<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

function envv(string $k, string $d=''): string {
  $v = getenv($k);
  return ($v === false || $v === '') ? $d : $v;
}

$DB_HOST = envv('MYSQL_HOST', 'mysql');
$DB_NAME = envv('MYSQL_DB',   'shooting_db');
$DB_USER = envv('MYSQL_USER', 'admin');
$DB_PASS = envv('MYSQL_PASSWORD', 'password');

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;
  try {
    $pdo = new PDO(
      "mysql:host={$GLOBALS['DB_HOST']};dbname={$GLOBALS['DB_NAME']};charset=utf8mb4",
      $GLOBALS['DB_USER'],
      $GLOBALS['DB_PASS'],
      [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]
    );
    return $pdo;
  } catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["ok"=>false,"error"=>"db_connect_failed","message"=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

function json_input(): array {
  $raw = file_get_contents('php://input') ?: '';
  $js = json_decode($raw, true);
  return is_array($js) ? $js : [];
}

function ok(array $a=[]): void {
  echo json_encode(array_merge(["ok"=>true], $a), JSON_UNESCAPED_UNICODE);
  exit;
}
function bad(string $code, ?string $msg=null, int $status=400): void {
  http_response_code($status);
  echo json_encode(["ok"=>false,"error"=>$code,"message"=>$msg], JSON_UNESCAPED_UNICODE);
  exit;
}

function sid_cookie_name(): string { return 'sid'; }
function current_session_sid(): string { return (string)($_COOKIE[sid_cookie_name()] ?? ''); }

function current_player_id(): ?int {
  $sid = current_session_sid();
  if ($sid === '' || !preg_match('/^[a-f0-9]{64}$/', $sid)) return null;
  $st = db()->prepare("SELECT player_id FROM sessions WHERE sid=? LIMIT 1");
  $st->execute([$sid]);
  $r = $st->fetch();
  return $r ? (int)$r['player_id'] : null;
}

function set_session_for_player(int $player_id): void {
  $sid = bin2hex(random_bytes(32)); 
  db()->prepare("INSERT INTO sessions(sid, player_id) VALUES(?,?)")->execute([$sid, $player_id]);
  setcookie(
    sid_cookie_name(), $sid,
    [
      'expires'  => time() + 60*60*24*30,
      'path'     => '/',
      'httponly' => true,
      'samesite' => 'Lax',
    ]
  );
}

function clear_session(): void {
  $sid = current_session_sid();
  if ($sid !== '') {
    db()->prepare("DELETE FROM sessions WHERE sid=?")->execute([$sid]);
  }
  setcookie(sid_cookie_name(), '', ['expires'=>time()-3600, 'path'=>'/']);
}

function upsert_player_by_name(string $player_name): int {
  $player_name = trim($player_name);
  $player_name = mb_substr($player_name, 0, 32, 'UTF-8');
  if ($player_name === '') bad('invalid_player_name', 'ユーザー名を入力してください', 400);

  $st = db()->prepare("SELECT id FROM players WHERE player_name=? LIMIT 1");
  $st->execute([$player_name]);
  $r = $st->fetch();
  if ($r) return (int)$r['id'];

  db()->prepare("INSERT INTO players(player_name, pass_hash) VALUES(?,?)")->execute([$player_name, '']);
  return (int)db()->lastInsertId();
}
