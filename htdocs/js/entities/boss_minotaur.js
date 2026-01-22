import { imgOf } from '../core/assets.js';
import { EnemyBullet } from './bullets.js';
import { ENEMY_RADIUS, CFG, DIFFICULTY } from '../core/config.js';

export class MinotaurBoss {
  constructor(x, y, diffKey){
    const diff = DIFFICULTY[diffKey] ?? DIFFICULTY.normal;

    this.key = 'boss.minotaur';
    this.x = x; this.y = y;

    this.r = ENEMY_RADIUS[this.key] ?? 40;
    this.hit = Math.round(this.r * CFG.HIT_SCALE);

    this.hp = Math.round(180 * diff.enemyHpMul);
    this.dead = false;

    this.spdMul = diff.enemySpdMul;

    
    this.state = 'track'; 

  
    this.windupT = 0;
    this.chargeT = 0;
    this.recoverT = 0;
    this.chargeCd = 1.8;

  
    this.vx = 0;

   
    this.fireCd = 0.35;

    this.enraged = false;
  }

  update(dtF, enemyBullets, W){
    
    const dt = dtF / 60;
    this.t += dtF;

  
    if (!this.enraged && this.hp <= 90){
      this.enraged = true;
      this.chargeCd = 1.2;
    }

    const pad = this.r + 6;
    const clampX = () => {
      if (this.x < pad) this.x = pad;
      if (this.x > W - pad) this.x = W - pad;
    };

   
    if (this.state === 'track'){
      
      this.x += Math.sin(this.t * 0.03) * (0.8 + (this.enraged ? 0.6 : 0.0)) * this.spdMul;
      clampX();

      this.chargeCd -= dt;
      if (this.chargeCd <= 0){
        this.state = 'windup';
        this.windupT = this.enraged ? 0.35 : 0.45; 
      }
    }
    else if (this.state === 'windup'){
      this.windupT -= dt;
      if (this.windupT <= 0){
        this.state = 'charge';
        this.chargeT = this.enraged ? 0.55 : 0.65;

        
        const dir = (Math.random() < 0.5 ? -1 : 1);
        this.vx = dir * (7.5 + (this.enraged ? 2.0 : 0.0)) * this.spdMul; 
      }
    }
    else if (this.state === 'charge'){
      this.x += this.vx * dtF;
      clampX();
      this.chargeT -= dt;
      if (this.chargeT <= 0){
        this.state = 'recover';
        this.recoverT = this.enraged ? 0.45 : 0.55;

        
        const vx = (this.enraged ? 3.8 : 3.2) * this.spdMul;
        const vy = (this.enraged ? 6.0 : 5.4) * this.spdMul;
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 10, -vx, vy));
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 10,  0.0, vy + 0.3));
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 10,  vx, vy));
      }
    }
    else if (this.state === 'recover'){
      this.recoverT -= dt;
      if (this.recoverT <= 0){
        this.state = 'track';
        this.chargeCd = this.enraged ? 1.0 : 1.5;
        this.vx = 0;
      }
    }

    if (this.state === 'track'){
      this.fireCd -= dt;
      if (this.fireCd <= 0){
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 10, 0.0, (this.enraged ? 5.6 : 5.0) * this.spdMul));
        this.fireCd = this.enraged ? 0.55 : 0.75;
      }
    }
  }

  render(ctx){
    const im = imgOf('boss.minotaur');
    if (im){
      const s = this.r*2;

      
      if (this.state === 'windup' && Math.floor(this.t / 4) % 2 === 0){
        ctx.globalAlpha = 0.75;
      }
      ctx.drawImage(im, this.x-s/2, this.y-s/2, s, s);
      ctx.globalAlpha = 1;
      return;
    }

    ctx.fillStyle = '#a85';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }
}
