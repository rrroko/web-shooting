import { EnemyBullet } from './bullets.js';
import { ENEMY_RADIUS, CFG, DIFFICULTY } from '../core/config.js';
import { imgOf } from '../core/assets.js';

export class AngelBoss {
  constructor(x, y, diffKey){
    const diff = DIFFICULTY[diffKey] ?? DIFFICULTY.normal;
    this.key = 'boss.angel';
    this.x = x; this.y = y;
    this.r = ENEMY_RADIUS[this.key] ?? 42;
    this.hit = Math.round(this.r * CFG.HIT_SCALE);
    this.hp = Math.round(160 * diff.enemyHpMul);
    this.dead = false;

    this.vx = 1.9 * diff.enemySpdMul;
    this.fireCd = 0.55;
  }

  update(dtF, enemyBullets, W){
    this.x += this.vx * dtF;
    if (this.x < this.r || this.x > W - this.r) this.vx *= -1;

    this.fireCd -= dtF/60;
    if (this.fireCd <= 0){
      for (let i=-3;i<=3;i++){
        enemyBullets.push(new EnemyBullet(this.x + i*12, this.y + this.r, 5.2));
      }
      this.fireCd = 0.75;
    }
  }

  render(ctx){
    const im = imgOf('boss.angel');
    if (im){
      const s = this.r*2;
      ctx.drawImage(im, this.x-s/2, this.y-s/2, s, s);
      return;
    }

    ctx.fillStyle = '#eef';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(this.x - 32, this.y); ctx.lineTo(this.x - 60, this.y + 12);
    ctx.moveTo(this.x + 32, this.y); ctx.lineTo(this.x + 60, this.y + 12);
    ctx.stroke();
  }
}
