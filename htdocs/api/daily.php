<?php
require __DIR__ . '/_bootstrap.php';
$now = new DateTime('now', new DateTimeZone('Asia/Tokyo'));
$seed = $now->format('Ymd');
$expire = (clone $now)->setTime(23, 59, 59)->format(DateTime::ATOM);
$mutators = ['fast_bullets']; 
respond(['ok'=>true, 'seed'=>$seed, 'mutators'=>$mutators, 'expire_at'=>$expire]);
