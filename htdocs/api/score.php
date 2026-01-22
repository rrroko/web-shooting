<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$uid = current_player_id();
if (!$uid) bad('unauthorized', 'ログインが必要です', 401);

$in = json_input();
$mode = isset($in['mode']) ? (string)$in['mode'] : 'story';
$stage = isset($in['stage']) && $in['stage'] !== null ? (int)$in['stage'] : null;
$is_clear = !empty($in['is_clear']) ? 1 : 0;
$score = isset($in['score']) ? (int)$in['score'] : 0;
$duration_ms = isset($in['duration_ms']) ? (int)$in['duration_ms'] : 0;
$difficulty = isset($in['difficulty']) ? (string)$in['difficulty'] : 'normal';

if (!preg_match('/^(story|survival)$/', $mode)) bad('invalid_mode');
if (!preg_match('/^(easy|normal|hard)$/', $difficulty)) $difficulty = 'normal';
if ($score < 0 || $duration_ms < 0) bad('invalid_score');

$st = db()->prepare("INSERT INTO scores(player_id, mode, difficulty, stage, is_clear, score, duration_ms) VALUES(?,?,?,?,?,?,?)");
$st->execute([$uid, $mode, $difficulty, $stage, $is_clear, $score, $duration_ms]);

ok(['id' => (int)db()->lastInsertId()]);
