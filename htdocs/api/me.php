<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$uid = current_player_id();
if (!$uid) bad('unauthorized', '未ログインです', 401);

$st = db()->prepare("SELECT id, player_name, created_at FROM players WHERE id=?");
$st->execute([$uid]);
$p = $st->fetch();
if (!$p) { clear_session(); bad('unauthorized', 'セッションが無効です', 401); }

ok(['player'=>$p]);
