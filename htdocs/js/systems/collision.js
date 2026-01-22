import { hitCircle } from '../core/utils.js';
import { WEAPONS } from '../core/config.js';

export function collidePlayerBullets({ player, bullets, enemies, scoreState }){
  let hits = 0;

  for (const b of bullets){
    if (b.dead) continue;

    if (b.exploded != null){
      for (const e of enemies){
        if (e.dead) continue;
        if (hitCircle(b.x, b.y, b.r, e.x, e.y, e.hit)){
          b.exploded = true;
          break;
        }
      }
      continue;
    }

    for (const e of enemies){
      if (e.dead) continue;
      if (hitCircle(b.x, b.y, b.r, e.x, e.y, e.hit)){
        e.hp -= b.damage ?? 1;
        b.dead = true;
        hits++;
        scoreState.add(10);
        break;
      }
    }
  }

  const w = WEAPONS[player.weaponId] ?? WEAPONS.pulse;
  if (w.type === 'laser' && player.fireT > (w.fireInterval - 0.05)) {

    for (const e of enemies){
      if (e.dead) continue;

      if (e.y < player.y && Math.abs(e.x - player.x) < 18){
        e.hp -= w.damage;
        hits++;
        scoreState.add(12);
      }
    }
  }

  return hits;
}

export function collideEnemyBullets({ player, enemyBullets }){
  let damaged = 0;
  for (const b of enemyBullets){
    if (b.dead) continue;
    if (hitCircle(b.x, b.y, b.r, player.x, player.y, player.hit)){
      b.dead = true;
      player.hp -= 1;
      damaged++;
    }
  }
  return damaged;
}

export function cleanupDead(arr, W, H, pad=120){
  for (const o of arr){
    if (!o.dead) {
      if (o.y < -pad || o.y > H+pad || o.x < -pad || o.x > W+pad) o.dead = true;
    }
  }

  for (let i=arr.length-1;i>=0;i--){
    if (arr[i].dead) arr.splice(i,1);
  }
}
