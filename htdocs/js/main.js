import { CFG } from './core/config.js';
import { ensureAssets } from './core/assets.js';
import { makeInput } from './core/input.js';
import { MODE, STAGE, DIFF } from './core/params.js';

import { Player } from './entities/player.js';
import { Bullet, Missile } from './entities/bullets.js';
import { Enemy } from './entities/enemy.js';
import { MimicBoss } from './entities/boss_mimic.js';
import { AngelBoss } from './entities/boss_angel.js';

import { buildStageEvents } from './systems/stage.js';
import { rollDrop } from './systems/drop.js';
import { collidePlayerBullets, collideEnemyBullets, cleanupDead } from './systems/collision.js';
import { makeScore, postScore } from './systems/score.js';
import { createStarfield } from './systems/background.js';
import { waveStart, waveUpdate, waveRender } from './systems/wave.js';

import { bindHud } from './ui/hud.js';
import { showResult } from './ui/result.js';

function loadLoadout(){
  try {
    const raw = localStorage.getItem('loadout');
    if (!raw) return { ship:'falcon', weapon:'pulse' };
    const x = JSON.parse(raw);
    return { ship: x.ship ?? 'falcon', weapon: x.weapon ?? 'pulse' };
  } catch {
    return { ship:'falcon', weapon:'pulse' };
  }
}

export async function boot(){
  const canvas = document.getElementById('cv');
  const ctx = canvas.getContext('2d');
  canvas.width  = CFG.W;
  canvas.height = CFG.H;

  const bg = createStarfield(CFG.W, CFG.H);

  const hud = bindHud();
  const input = makeInput();
  const scoreState = makeScore();

  await ensureAssets();

  const loadout = loadLoadout();
  const player = new Player(CFG.W/2, CFG.H-90, loadout.ship, loadout.weapon);

  const bullets = [];
  const enemyBullets = [];
  const enemies = [];

  const events = (MODE === 'story') ? buildStageEvents(STAGE) : [];
  let evIdx = 0;
  let t = 0;

  function addDrop(key){
    const d = rollDrop(key);
    if (!d) return;
    const inv = JSON.parse(localStorage.getItem('inv') ?? '{}');
    inv[d.item] = (inv[d.item] ?? 0) + d.qty;
    localStorage.setItem('inv', JSON.stringify(inv));
  }

  let ended = false;
  let clear = false;

  function spawn(key){
    if (key === 'boss.mimic') {
      enemies.push(new MimicBoss(CFG.W/2, 120, DIFF));
      return;
    }
    if (key === 'boss.angel') {
      enemies.push(new AngelBoss(CFG.W/2, 120, DIFF));
      return;
    }
    enemies.push(new Enemy(Math.random()*(CFG.W-60)+30, -30, key, DIFF));
  }

  function update(dt){
    if (ended) return;

    bg.update(dt);

    t += dt;

    while (evIdx < events.length && t >= events[evIdx][0]){
      spawn(events[evIdx][1]);
      evIdx++;
    }

    player.update(dtF, input, CFG.W, CFG.H);

    if (input.down(' ') || input.down('space')){
      player.tryFire(bullets);
    }

    for (const b of bullets) b.update(dtF);
    for (const b of enemyBullets) b.update(dtF);

    for (const e of enemies) e.update(dtF, enemyBullets, CFG.W);

    for (const b of bullets){
      if (b instanceof Missile){
        b.explode(enemies);
      }
    }

    collidePlayerBullets({ player, bullets, enemies, scoreState });
    collideEnemyBullets({ player, enemyBullets });

    if (player.hp <= 0){
      ended = true;
      clear = false;
      return;
    }

    for (const e of enemies){
      if (!e.dead && e.hp <= 0){
        e.dead = true;
        scoreState.add(e.key.startsWith('boss.') ? 500 : 50);
        addDrop(e.key);
      }
    }

    cleanupDead(bullets, CFG.W, CFG.H, CFG.OFFSCREEN_PAD);
    cleanupDead(enemyBullets, CFG.W, CFG.H, CFG.OFFSCREEN_PAD);
    cleanupDead(enemies, CFG.W, CFG.H, CFG.OFFSCREEN_PAD);

    if (MODE === 'story'){
      if (evIdx >= events.length && enemies.length === 0){
        ended = true;
        clear = true;
      }
    }
  }

  function render(){

    bg.render(ctx);

    player.render(ctx);

    for (const b of bullets) b.render(ctx);
    for (const b of enemyBullets) b.render(ctx);

    for (const e of enemies) e.render(ctx);

    hud.setHp(player.hp);
    hud.setScore(scoreState.get());
  }

  let last = performance.now();
  let tSec = 0;
  async function loop(now){
    const dtF = Math.min(2.5, (now - last) / 16.6667); 
    last = now;

    tSec += dtF / 60;

    update(dtF, tSec);
    render();

    if (!ended){
      requestAnimationFrame(loop);
      return;
    }

    showResult(hud, { clear, score: scoreState.get() });

    await postScore({
      mode: MODE,
      stage: STAGE,
      difficulty: DIFF,
      is_clear: clear ? 1 : 0,
      score: scoreState.get(),
      duration_ms: Math.round(t*1000)
    });
  }

  requestAnimationFrame(loop);
}
