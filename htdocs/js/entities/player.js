import { clamp } from '../core/utils.js';
import { SHIPS, WEAPONS } from '../core/config.js';
import { Bullet, Missile } from './bullets.js';
import { imgOf } from '../core/assets.js';

export class Player {
  constructor(x, y, shipId, weaponId){
    const ship = SHIPS[shipId] ?? SHIPS.falcon;
    this.shipId = shipId;
    this.weaponId = weaponId;

    this.x = x;
    this.y = y;

    this.maxHp = ship.maxHp;
    this.hp = ship.maxHp;
    this.speed = ship.speed;
    this.hit = ship.hitRadius;
    this.spriteKey = ship.spriteKey;

    this.fireT = 0;
  }

  setLoadout(shipId, weaponId){
    const ship = SHIPS[shipId] ?? SHIPS.falcon;
    this.shipId = shipId;
    this.weaponId = weaponId;

    this.maxHp = ship.maxHp;
    this.hp = Math.min(this.hp, this.maxHp);
    this.speed = ship.speed;
    this.hit = ship.hitRadius;
    this.spriteKey = ship.spriteKey;
  }

  update(dtF, input, W, H){
    const sp = this.speed * dtF;
    if (input.down('arrowleft') || input.down('a'))  this.x -= sp;
    if (input.down('arrowright')|| input.down('d'))  this.x += sp;
    if (input.down('arrowup')   || input.down('w'))  this.y -= sp;
    if (input.down('arrowdown') || input.down('s'))  this.y += sp;

    this.x = clamp(this.x, 20, W-20);
    this.y = clamp(this.y, 20, H-20);

    this.fireT -= (dtF/60);
  }

  tryFire(bullets){
    const w = WEAPONS[this.weaponId] ?? WEAPONS.pulse;
    if (this.fireT > 0) return;

    if (w.type === 'single'){
      bullets.push(new Bullet(this.x, this.y-14, -w.bulletSpeed, w.damage));
      this.fireT = w.fireInterval;
      return;
    }

    if (w.type === 'spread'){
      const n = w.pellet ?? 3;
      for (let i=0;i<n;i++){
        const dx = (i - (n-1)/2) * 8;
        bullets.push(new Bullet(this.x+dx, this.y-14, -w.bulletSpeed, w.damage));
      }
      this.fireT = w.fireInterval;
      return;
    }

    if (w.type === 'laser'){

      this.fireT = w.fireInterval;
      return;
    }

    if (w.type === 'missile'){
      bullets.push(new Missile(this.x, this.y-18, -w.bulletSpeed, w.damage, w.explodeRadius, w.ttl));
      this.fireT = w.fireInterval;
      return;
    }
  }

  render(ctx){
    const im = imgOf(this.spriteKey);
    if (im){
      const s = this.hit*2;
      ctx.drawImage(im, this.x-s/2, this.y-s/2, s, s);
    } else {
      ctx.fillStyle = '#6ef';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.hit, 0, Math.PI*2); ctx.fill();
    }
  }
}
