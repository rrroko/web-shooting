import { CFG, ENEMY_RADIUS, DIFFICULTY } from '../core/config.js';
import { imgOf } from '../core/assets.js';
import { rand } from '../core/utils.js';
import { EnemyBullet } from './bullets.js';

export class Enemy {
  constructor(x, y, key, diffKey){
    this.x = x; this.y = y;
    this.key = key;
    this.sprite = imgOf(key);

    this.r = ENEMY_RADIUS[key] ?? 16;
    this.hit = Math.round(this.r * CFG.HIT_SCALE);
    this.dead = false;

    const diff = DIFFICULTY[diffKey] ?? DIFFICULTY.normal;

    const baseVy = CFG.ENEMY_BASE_VY * diff.enemySpdMul * (0.9 + Math.random()*0.4);

    this.vy = baseVy;
    this.hp = Math.round(1 * diff.enemyHpMul);
    this.vxAmp = 0;
    this.phase = rand(0, Math.PI*2);
    this.wave = rand(3.0, 5.0);

    if (key === 'enemy.ghost_black'){
      this.vy = baseVy * 1.25;
      this.vxAmp = 70;
      this.hp = Math.round(1 * diff.enemyHpMul);
      this.fireCd = rand(1.2, 1.8);
    } else if (key === 'enemy.gargoyle_purple'){
      this.vy = baseVy * 0.85;
      this.hp = Math.round(3 * diff.enemyHpMul);
      this.fireCd = rand(1.0, 1.4); 
    } else if (key === 'enemy.bat_red'){
      this.vy = baseVy * 1.8;
      this.hp = Math.round(1 * diff.enemyHpMul);
    } else if (key === 'enemy.knight_blue'){
      this.vy = baseVy * 0.6;
      this.hp = Math.round(4 * diff.enemyHpMul);
    } else if (key === 'enemy.witch_purple'){
      this.vy = baseVy * 0.9;
      this.hp = Math.round(2 * diff.enemyHpMul);
      this.fireCd = 0.6; 
    }
  }

  update(dtF, enemyBullets){
    this.y += this.vy * dtF;

    if (this.vxAmp > 0){
      this.phase += this.wave * (dtF/60);  
      this.x += Math.sin(this.phase) * this.vxAmp * (dtF/60);
    }

    if (this.fireCd != null){
      this.fireCd -= dtF/60; 
      if (this.fireCd <= 0){
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.r, 4.0));
        this.fireCd = (this.key === 'enemy.witch_purple') ? 0.8 : 1.3;
      }
    }
  }

  render(ctx){
    if (this.sprite){
      const s = this.r*2;
      ctx.drawImage(this.sprite, this.x-s/2, this.y-s/2, s, s);
    } else {
      ctx.fillStyle = '#f55';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    }
  }
}
