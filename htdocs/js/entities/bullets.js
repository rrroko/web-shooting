import { hitCircle } from '../core/utils.js';

export class Bullet {
  constructor(x, y, vy, damage){
    this.x = x; this.y = y;
    this.vy = vy;
    this.damage = damage;
    this.r = 4;
    this.dead = false;
  }
  update(dtF){
    this.y += this.vy * dtF;
  }

  render(ctx){
    ctx.fillStyle = '#9cf';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }
}

export class EnemyBullet {
  constructor(x, y, vy){
    this.x = x; this.y = y;
    this.vy = vy;
    this.r = 5;
    this.dead = false;
  }
  update(dtF){
    this.y += this.vy * dtF;
  }

  render(ctx){
    ctx.fillStyle = '#f8a';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }
}

export class Missile {
  constructor(x, y, vy, damage, explodeRadius, ttl){
    this.x = x; this.y = y;
    this.vy = vy;
    this.damage = damage;
    this.explodeRadius = explodeRadius;
    this.ttl = ttl;
    this.r = 6;
    this.dead = false;
    this.exploded = false;
  }
  update(dtF){
    this.y += this.vy * dtF;
    this.ttl -= dtF;          
    if (this.ttl <= 0 && !this.exploded) this.exploded = true;
  }

  render(ctx){
    ctx.fillStyle = '#ffd27d';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }

  explode(enemies){
    if (this.dead) return 0;
    if (!this.exploded) return 0;
    this.dead = true;
    let hits = 0;
    for (const e of enemies){
      if (e.dead) continue;
      if (hitCircle(this.x, this.y, this.explodeRadius, e.x, e.y, e.hit)){
        e.hp -= this.damage;
        hits++;
      }
    }
    return hits;
  }
}
