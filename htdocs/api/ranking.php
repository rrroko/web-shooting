<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$mode = $_GET['mode'] ?? 'survival';
$difficulty = $_GET['difficulty'] ?? 'normal';
$stage = isset($_GET['stage']) ? (int)$_GET['stage'] : null;
$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;

if (!preg_match('/^(story|survival)$/', $mode)) $mode = 'survival';
if (!preg_match('/^(easy|normal|hard)$/', $difficulty)) $difficulty = 'normal';

$sql = "
  SELECT p.player_name, s.score, s.duration_ms, s.created_at, s.mode, s.difficulty, s.stage
  FROM scores s
  JOIN players p ON p.id = s.player_id
  WHERE s.mode = ? AND s.difficulty = ?
";
$params = [$mode, $difficulty];

if ($mode === 'story' && $stage !== null && $stage >= 1 && $stage <= 99) {
  $sql .= " AND s.stage = ? ";
  $params[] = $stage;
}

$sql .= " ORDER BY s.score DESC, s.duration_ms ASC LIMIT {$limit}";

$st = db()->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

ok(['rows'=>$rows]);
