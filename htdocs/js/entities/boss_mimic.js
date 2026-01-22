import { imgOf } from '../core/assets.js';
import { EnemyBullet } from './bullets.js';
import { ENEMY_RADIUS, CFG, DIFFICULTY } from '../core/config.js';

export class MimicBoss {
  constructor(x, y, diffKey){
    const diff = DIFFICULTY[diffKey] ?? DIFFICULTY.normal;
    this.key = 'boss.mimic';
    this.x = x; this.y = y;
    this.r = ENEMY_RADIUS[this.key] ?? 36;
    this.hit = Math.round(this.r * CFG.HIT_SCALE);
    this.hp = Math.round(120 * diff.enemyHpMul);
    this.dead = false;

    this.vx = 1.6 * diff.enemySpdMul;
    this.fireCd = 0.7;
  }

  update(dtF, enemyBullets, W){
    this.x += this.vx * dtF;
    if (this.x < this.r || this.x > W - this.r) this.vx *= -1;

    this.fireCd -= dtF/60;
    if (this.fireCd <= 0){

      for (let i=-1;i<=1;i++){
        enemyBullets.push(new EnemyBullet(this.x + i*14, this.y + this.r, 4.8));
      }
      this.fireCd = 0.9;
    }
  }

  render(ctx){
    const im = imgOf('boss.mimic');
    if (im){
      const s = this.r*2;
      ctx.drawImage(im, this.x-s/2, this.y-s/2, s, s);
      return;
    }
    ctx.fillStyle = '#c66';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }
}
