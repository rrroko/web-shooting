<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$in = json_input();
$name = (string)($in['player_name'] ?? '');

$player_id = upsert_player_by_name($name);

clear_session();
set_session_for_player($player_id);

ok(['player_id'=>$player_id, 'player_name'=>$name]);
