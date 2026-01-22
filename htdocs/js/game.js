

const SHIPS = {
  falcon:  { name:'Falcon',  maxHp:5,  speed:5.0, fireRate:0.15, hitRadius:14, spriteKey:'player.ship_1' },
  striker: { name:'Striker', maxHp:7,  speed:4.0, fireRate:0.20, hitRadius:16, spriteKey:'player.ship_2' },
  titan:   { name:'Titan',   maxHp:10, speed:3.0, fireRate:0.30, hitRadius:18, spriteKey:'player.ship_3' }
};

const WEAPONS = {
  pulse: {
    name: 'Pulse',
    bulletSpeed: 8,
    damage: 1,
    fireInterval: 0.15
  },
  scatter: {
    name: 'Scatter',
    pellet: 3,
    spread: 0.25,
    bulletSpeed: 8,
    damage: 1,
    fireInterval: 0.35
  },
  missile: {
    name: 'Missile',
    bulletSpeed: 4,
    damage: 2,
    explodeRadius: 48,
    ttl: 90,
    fireInterval: 0.8
  }
};

let MANIFEST = null;
window.Assets = window.Assets || { images:{} };

async function ensureAssets() {
  if (MANIFEST) return; 
  const res = await fetch('/assets/manifest.json', {cache:'no-store'});
  MANIFEST = await res.json();

  for (const [key, src] of Object.entries(MANIFEST)) {
    const im = new Image();
    im.src = src;
    Assets.images[key] = im;
  }
}

function imgOf(key) {
  return (key && Assets.images && Assets.images[key]) ? Assets.images[key] : null;
}
window.imgOf = imgOf;

(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const param = (k, d = null) => new URLSearchParams(location.search).get(k) ?? d;

  const MODE = param('mode', 'story');
  let STAGE = Math.max(1, parseInt(param('stage', '1'), 10) || 1);
  if (MODE === 'survival') STAGE = 0;
  const DIFF  = param('difficulty', 'normal');

  const CFG = {
    WIDTH:  null, 
    HEIGHT: null,

    PLAYER_R: 22,
    ENEMY_R:  16,
    BOSS_R:   74,
    HIT_SCALE: 0.65,

    PLAYER_MAX_HP: 3,
    PLAYER_SPEED:  300,   
    SHOT_SPEED:    520,   
    FIRE_INTERVAL: 0.14,  

    ENEMY_BASE_VY: 70,    
    SPAWN_INTERVAL: 0.9,  

    STAR_COUNT: 120
  };

const ENEMY_DEF = {
  'enemy.slime_purple':   { r:14, hp:2, spd:1.00, move:'straight',  fire:'down_single', interval:[1.0,1.4] },
  'enemy.ghost_black':   { r:12, hp:2, spd:1.18, move:'zigzag',    fire:'aim_single',  interval:[1.2,1.8] },
  'enemy.gargoyle_purple':{ r:18, hp:4, spd:0.85, move:'tank',      fire:'burst_2', interval:[1.7,2.4] },
  'enemy.ghost_white':   { r:12, hp:2, spd:1.10, move:'hover',     fire:'aim_double',  interval:[1.4,2.0] },
  'enemy.gargoyle_stone':{ r:20, hp:5, spd:0.78, move:'tank',      fire:'spread_3_narrow',    interval:[1.6,2.2] },
  'enemy.hi':            { r:10, hp:1, spd:1.45, move:'dive',      fire:'none',        interval:[999,999] },
  'enemy.ika':           { r:16, hp:3, spd:0.95, move:'wave',      fire:'spread_3_wave',    interval:[0.9,1.3] },
  'enemy.jackolantern':  { r:15, hp:3, spd:0.90, move:'stutter',   fire:'fan_5',       interval:[1.4,1.9] },
  'enemy.yeti':          { r:22, hp:6, spd:0.72, move:'tank',      fire:'mine_drop_2',    interval:[1.2,1.6] },
  'enemy.kyuketsuki':    { r:14, hp:3, spd:1.05, move:'track_x',   fire:'aim_double_homing',  interval:[0.9,1.2] },
  'enemy.monster_hana':  { r:17, hp:4, spd:0.92, move:'wave_slow', fire:'wave_pair',   interval:[1.0,1.5] },
  'enemy.treant':        { r:26, hp:9, spd:0.60, move:'tank',      fire:'ring_8_inward',      interval:[2.0,2.6] },
};

const STAGE_POOLS = {
  1: ['enemy.slime_purple','enemy.ghost_black','enemy.hi','enemy.gargoyle_purple'],
  2: ['enemy.ghost_white','enemy.gargoyle_purple','enemy.ika','enemy.jackolantern','enemy.yeti','enemy.slime_purple'],
  3: ['enemy.gargoyle_stone','enemy.kyuketsuki','enemy.monster_hana','enemy.treant','enemy.ika','enemy.ghost_white'],
};

const SURVIVAL_POOL = Array.from(new Set([].concat(...Object.values(STAGE_POOLS))));

function currentEnemyKeys(){
  if (MODE === 'survival') return SURVIVAL_POOL;
  return STAGE_POOLS[STAGE] ?? STAGE_POOLS[1];
}
const ENEMY_KEYS = currentEnemyKeys();

const ENEMY_RADIUS = Object.fromEntries(Object.entries(ENEMY_DEF).map(([k,v])=>[k,v.r]));

  const canvas = $('#game') || document.querySelector('canvas');
  if (!canvas) {
    console.error('[game] <canvas> not found');
    return;
  }
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const W = CFG.WIDTH  ? (canvas.width  = +CFG.WIDTH)  : canvas.width;
  const H = CFG.HEIGHT ? (canvas.height = +CFG.HEIGHT) : canvas.height;

  function drawSpriteOrCircle(im, x, y, r, color = '#fff') {
    const target = Math.max(8, r * 2);
    if (im && im.complete && (im.naturalWidth || im.width) > 0) {
      const iw = im.naturalWidth || im.width;
      const ih = im.naturalHeight || im.height;
      const scale = Math.min(target / iw, target / ih);
      const dw = Math.max(1, Math.round(iw * scale));
      const dh = Math.max(1, Math.round(ih * scale));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(im, Math.round(x - dw / 2), Math.round(y - dh / 2), dw, dh);
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const keys = Object.create(null);
  addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') tryRetry();
  });
  addEventListener('keyup', (e) => (keys[e.key] = false));

  class Bullet {
    constructor(x, y, vy = -CFG.SHOT_SPEED) {
      this.x = x; this.y = y; this.vy = vy;
      this.r = 3; this.dead = false;
    }
    update(dt) {
      this.y += this.vy * dt;
      if (this.y < -10 || this.y > H + 10) this.dead = true;
    }
    render() {
      if (this.sprite) { drawSpriteOrCircle(this.sprite, this.x, this.y, this.r+1, '#ffd24d'); return; }
      ctx.fillStyle = '#ffd24d';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  

  function degToRad(d){ return d * Math.PI / 180; }
  function shootFrom(e, deg, speed=260, opt={}){
    const r = degToRad(deg);
    const vx = Math.cos(r) * speed;
    const vy = Math.sin(r) * speed;
    enemyBullets.push(new EnemyBullet(e.x, e.y + e.r + 2, vx, vy, opt));
  }
  function aimDegFrom(e){
    const dx = (player.x - e.x);
    const dy = (player.y - e.y);
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }
  function fireEnemyPattern(e, fire){
    const sc = (MODE === 'survival') ? survScale() : {bullet:1.0};
    const baseSpeed = (250 + Math.min(160, (time*6))) * (sc.bullet ?? 1.0); 
    if (fire === 'down_single'){
      shootFrom(e, 90 + (-8 + Math.random()*16), baseSpeed);
      return;
    }

    if (fire === 'burst_2'){

      const a = 90 + (-6 + Math.random()*12);
      shootFrom(e, a - 2.5, baseSpeed*0.95);
      shootFrom(e, a + 2.5, baseSpeed*1.05);
      return;
    }
    if (fire === 'aim_single'){
      shootFrom(e, aimDegFrom(e), baseSpeed, { kind:'homing', turn: 3.2 });
      return;
    }
    if (fire === 'aim_double'){
      const a = aimDegFrom(e);
      shootFrom(e, a - 4, baseSpeed);
      shootFrom(e, a + 4, baseSpeed);
      return;
    }
    if (fire === 'aim_double_homing'){
      const a = aimDegFrom(e);
      shootFrom(e, a - 5, baseSpeed*0.95, { kind:'homing', turn: 4.0 });
      shootFrom(e, a + 5, baseSpeed*0.95, { kind:'homing', turn: 4.0 });
      return;
    }
    if (fire === 'spread_3'){
      const a = aimDegFrom(e);
      shootFrom(e, a - 14, baseSpeed);
      shootFrom(e, a,      baseSpeed);
      shootFrom(e, a + 14, baseSpeed);
      return;
    }
    if (fire === 'spread_3_narrow'){

      const a = aimDegFrom(e);
      shootFrom(e, a - 7, baseSpeed*1.02);
      shootFrom(e, a,     baseSpeed*1.06);
      shootFrom(e, a + 7, baseSpeed*1.02);
      return;
    }
    if (fire === 'fan_5'){

      const center = 90;
      const step = 10;
      for (let i=-2;i<=2;i++) shootFrom(e, center + i*step, baseSpeed*0.95, { bounce: 1 });
      return;
    }
    if (fire === 'spread_3_wave'){
      const a = aimDegFrom(e);
      shootFrom(e, a - 14, baseSpeed*0.90, {life: 3.0, kind:'wave', amp:16, freq:7});
      shootFrom(e, a,      baseSpeed*0.92, {life: 3.0, kind:'wave', amp:16, freq:7});
      shootFrom(e, a + 14, baseSpeed*0.90, {life: 3.0, kind:'wave', amp:16, freq:7});
      return;
    }

    if (fire === 'wave_pair'){

      const a = aimDegFrom(e);
      shootFrom(e, a - 10, baseSpeed*0.92, {life: 3.2, kind:'wave', amp:18, freq:7});
      shootFrom(e, a + 10, baseSpeed*0.92, {life: 3.2, kind:'wave', amp:18, freq:7});
      return;
    }
    if (fire === 'ring_8'){
      for (let i=0;i<8;i++){
        shootFrom(e, i*45, baseSpeed*0.85, {life: 1.2, kind:'split', splitN:3, splitSpd:210, splitLife:1.4});
      }
      return;
    }
    if (fire === 'ring_8_inward'){

      const cx = e.x, cy = e.y + 40;
      for (let i=0;i<8;i++){
        shootFrom(e, i*45, baseSpeed*0.82, {life: 2.2, kind:'inward', cx, cy, inAt: 0.75, r: 3});
      }
      return;
    }
    if (fire === 'mine_drop_2'){

      shootFrom(e, 90, baseSpeed*0.55, { kind:'mine', arm:0.55, r:4 });
      shootFrom(e, 90, baseSpeed*0.60, { kind:'mine', arm:0.75, r:4 });
      return;
    }

    shootFrom(e, 90, baseSpeed);
  }

class PlayerBullet extends Bullet {
    constructor(x, y, vx, vy, opt = {}) {
      super(x, y, 0); 
      this.vx = vx;
      this.vy2 = vy;
      this.r = opt.r ?? 3;
      this.damage = opt.damage ?? 1;
      this.pierce = opt.pierce ?? false;
      this.sprite = opt.spriteKey ? imgOf(opt.spriteKey) : null;
      this.dead = false;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy2 * dt;
      if (this.y < -20 || this.y > H + 20 || this.x < -20 || this.x > W + 20) this.dead = true;
    }
    render() {
      if (this.sprite) { drawSpriteOrCircle(this.sprite, this.x, this.y, this.r+1, '#ffd24d'); return; }
      ctx.fillStyle = '#ffd24d';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class MissileBullet extends PlayerBullet {
    constructor(x, y, vx, vy, opt = {}) {
      super(x, y, vx, vy, opt);
      this.ttl = opt.ttl ?? 90; 
      this.explodeR = opt.explodeRadius ?? 48;
      this.homing = opt.homing ?? 0; 
      this.cluster = opt.cluster ?? 0; 
      this._life = 0;
    }
    update(dt) {
      super.update(dt);

      if (this.homing > 0 && enemies.length){
        let best=null, bestD=1e18;
        for (const e of enemies){
          if (e.dead) continue;
          const dx=e.x-this.x, dy=e.y-this.y;
          const d=dx*dx+dy*dy;
          if (d<bestD){bestD=d; best=e;}
        }
        if (best){
          const dx=best.x-this.x, dy=best.y-this.y;
          const len=Math.max(1, Math.hypot(dx,dy));
          const sp=Math.hypot(this.vx, this.vy2);
          const tvx=(dx/len)*sp;
          const tvy=(dy/len)*sp;
          const k=Math.min(1, this.homing*dt*3.5);
          this.vx += (tvx-this.vx)*k;
          this.vy2 += (tvy-this.vy2)*k;
        }
      }
      this._life += dt;
      if (this._life >= (this.ttl / 60)) {
        this.explode();
      }
    }
    explode() {
      if (this.dead) return;
      this.dead = true;
      spawnExplosion(this.x, this.y, this.explodeR, this.damage);
      if (this.cluster && this.cluster > 0){
        for (let i=0;i<this.cluster;i++){
          const a = (Math.PI*2) * (i/this.cluster);
          const ox = Math.cos(a) * (this.explodeR*0.55);
          const oy = Math.sin(a) * (this.explodeR*0.55);
          spawnExplosion(this.x+ox, this.y+oy, Math.max(18, this.explodeR*0.55), this.damage*0.65);
        }
      }
    }
  }

  class ExplosionFx {
    constructor(x, y, r) {
      this.x = x; this.y = y; this.r = r;
      this.t = 0;
      this.dead = false;
    }
    update(dt) {
      this.t += dt;
      if (this.t > 0.25) this.dead = true;
    }
    render() {
      const a = Math.max(0, 1 - this.t / 0.25);
      ctx.save();
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = '#ffcc66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * (0.7 + this.t * 2.0), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  class EnemyBullet {

  constructor(x, y, a = 180, b = null, opt = {}) {
    this.x = x; this.y = y;
    let vx, vy;
    if (b === null || b === undefined) { vx = 0; vy = a; }
    else { vx = a; vy = b; }
    this.vx = vx; this.vy = vy;

    this.r = opt.r ?? 3;
    this.damage = opt.damage ?? 1;

    this.kind = opt.kind ?? 'plain';        
    this.life = opt.life ?? null;           
    this._t = 0;

    this.turn = opt.turn ?? 4.0;            

    this.amp = opt.amp ?? 26;               
    this.freq = opt.freq ?? 6.0;            
    this._baseX = this.x;

    this.bounce = opt.bounce ?? 0;          

    this.splitN = opt.splitN ?? 0;          
    this.splitSpd = opt.splitSpd ?? 220;    
    this.splitLife = opt.splitLife ?? 1.6;  

    this.arm = opt.arm ?? 0.45;             
    this._armed = false;

    this.cx = opt.cx; this.cy = opt.cy;     
    this.inAt = opt.inAt ?? 0.65;           
    this._turned = false;

    this.dead = false;
  }

  update(dt) {
    this._t += dt;

    if (this.kind === 'mine') {
      this.vy = Math.min(this.vy + 220 * dt, 360);
      this.x += Math.sin(this._t * 10) * 0.6;
      if (!this._armed) {
        this.arm -= dt;
        if (this.arm <= 0) this._armed = true;
      }
    }

    if (this.kind === 'homing' && player) {
      const tx = player.x, ty = player.y;
      const dx = tx - this.x, dy = ty - this.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const tvx = (dx / len) * Math.hypot(this.vx, this.vy);
      const tvy = (dy / len) * Math.hypot(this.vx, this.vy);
      const k = Math.min(1, this.turn * dt);
      this.vx = this.vx + (tvx - this.vx) * k;
      this.vy = this.vy + (tvy - this.vy) * k;
    }

    if (this.kind === 'wave') {
      this._baseX += this.vx * dt;
      this.y += this.vy * dt;
      this.x = this._baseX + Math.sin(this._t * this.freq) * this.amp;
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    if (this.bounce > 0) {
      if (this.x < this.r) { this.x = this.r; this.vx *= -1; this.bounce--; }
      if (this.x > W - this.r) { this.x = W - this.r; this.vx *= -1; this.bounce--; }
    }

    if (this.life !== null) {
      this.life -= dt;
      if (this.life <= 0) {

        if (this.kind === 'split' && this.splitN > 0) {
          const n = this.splitN;
          for (let i=0;i<n;i++){
            const a = (Math.PI * 2) * (i / n);
            enemyBullets.push(new EnemyBullet(
              this.x, this.y,
              Math.cos(a) * this.splitSpd,
              Math.sin(a) * this.splitSpd,
              { r: Math.max(2, this.r-1), life: this.splitLife }
            ));
          }
        }
        this.dead = true;
      }
    }

    if (this.x < -30 || this.x > W + 30 || this.y < -30 || this.y > H + 30) this.dead = true;
  }

  render() {
    ctx.fillStyle = (this.kind === 'mine' && this._armed) ? '#ff6b6b' : '#68b5ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

  class Player {
    constructor(x, y, shipDef, weaponDef, weaponLv) {
      this.x = x;
      this.y = y;
      this.r = shipDef.hitRadius;
      this.hit = Math.round(this.r * CFG.HIT_SCALE);
      this.sprite = imgOf(shipDef.spriteKey);

      this.maxHp = shipDef.maxHp;
      this.hp = shipDef.maxHp;
      this.speed = shipDef.speed;
      this.hitRadius = shipDef.hitRadius;

      this.weapon = weaponDef;
      this.weaponLv = weaponLv;
      this.fireCd = 0;
    }
    update(dt) {

      const sp = (this.speed * 75) * dt;
      if (keys['ArrowLeft'] || keys['a'])  this.x -= sp;
      if (keys['ArrowRight'] || keys['d']) this.x += sp;
      if (keys['ArrowUp'] || keys['w'])    this.y -= sp;
      if (keys['ArrowDown'] || keys['s'])  this.y += sp;
      this.x = Math.max(this.r, Math.min(W - this.r, this.x));
      this.y = Math.max(this.r, Math.min(H - this.r, this.y));

      const baseInterval = this.weapon?.fireInterval ?? 0.18;
      const interval = effectiveInterval(baseInterval, this.weaponLv ?? 1);
      this.fireCd -= dt;
      if (this.fireCd <= 0 && (keys[' '] || keys['Space'])) {
        fireWeapon(this);
        this.fireCd = interval;
      }
    }
    render() { drawSpriteOrCircle(this.sprite, this.x, this.y, this.r, '#6cf'); }
  }

  class Enemy {
    constructor(x, y, key) {
      this.x = x; this.y = y;
      this.key = key;
      this.sprite = imgOf(key);

      const def = ENEMY_DEF[key] ?? { r: CFG.ENEMY_R, hp: 1, spd: 1.0, move:'straight', fire:'down_single', interval:[1.2,1.8] };
      this.def = def;

      this.r = def.r ?? (ENEMY_RADIUS[key] ?? CFG.ENEMY_R);
      this.hit = Math.round(this.r * CFG.HIT_SCALE);
      this.hp = def.hp ?? 1;

      const baseVy = CFG.ENEMY_BASE_VY * (0.9 + Math.random() * 0.35);
      this.vy = baseVy * (def.spd ?? 1.0);

      if (MODE === 'survival') {
        const sc = survScale();
        this.hp = Math.max(1, Math.round(this.hp * sc.hp));
        this.vy *= sc.spd;
        const [a,b] = def.interval ?? [1.2,1.8];
        const aa = a / sc.fire, bb = b / sc.fire;
        this.fireCd = aa + Math.random() * Math.max(0.01, (bb-aa));
      }
      this.vx = 0;

      this.t = 0;
      this.phase = Math.random() * Math.PI * 2;

      if (MODE !== 'survival') {
        const [a,b] = def.interval ?? [1.2,1.8];
        this.fireCd = a + Math.random() * Math.max(0.01, (b-a));
      }
      this.dead = false;
    }

    update(dt) {
      this.t += dt;

      this.y += this.vy * dt;

      const move = this.def.move || 'straight';
      const amp = 80; 
      if (move === 'zigzag') {
        this.x += Math.sin(this.phase + this.t * 5.0) * (amp * 0.55) * dt;
      } else if (move === 'hover') {
        this.x += Math.sin(this.phase + this.t * 3.0) * (amp * 0.35) * dt;
        this.y += Math.sin(this.phase + this.t * 2.2) * 12 * dt;
      } else if (move === 'wave') {
        this.x += Math.sin(this.phase + this.t * 2.8) * (amp * 0.75) * dt;
      } else if (move === 'wave_slow') {
        this.x += Math.sin(this.phase + this.t * 1.7) * (amp * 0.55) * dt;
      } else if (move === 'track_x') {

        const dx = (player.x - this.x);
        this.x += Math.max(-90, Math.min(90, dx)) * 0.6 * dt;
      } else if (move === 'stutter') {

        const s = Math.sin(this.phase + this.t * 2.4);
        this.y += (s > 0.65 ? -this.vy*0.75 : 0) * dt;
        this.x += Math.sin(this.phase + this.t * 3.3) * (amp * 0.25) * dt;
      } else if (move === 'tank') {

        this.x += Math.sin(this.phase + this.t * 1.4) * (amp * 0.12) * dt;
      } else if (move === 'dive') {

        this.y += this.vy * 0.55 * dt;
        this.x += Math.sin(this.phase + this.t * 6.5) * (amp * 0.25) * dt;
      }

      this.fireCd -= dt;
      const fire = this.def.fire || 'down_single';
      if (fire !== 'none' && this.fireCd <= 0) {
        fireEnemyPattern(this, fire);
        const [a,b] = this.def.interval ?? [1.2,1.8];
        this.fireCd = a + Math.random() * Math.max(0.01, (b-a));
      }
    }

    render() {

      drawSpriteOrCircle(this.sprite, this.x, this.y, this.r, "#fff");

      const maxHp = this.def?.hp ?? this.hp;
      if ((maxHp ?? 0) >= 4) {}
    }

  }

  class Boss {
    constructor(x, y, type = 'mimic') {
      this.x = x; this.y = y;
      this.type = type;

      const DEF = {
        mimic:    { key:'boss.mimic',    r: CFG.BOSS_R,     hp: 40,  color:'#f88' },
        minotaur: { key:'boss.minotaur', r: CFG.BOSS_R+10,  hp: 70,  color:'#d8a15a' },
        angel:    { key:'boss.angel',    r: CFG.BOSS_R+14,  hp: 90,  color:'#ffe6a6' },
      };
      const d = DEF[type] ?? DEF.mimic;

      this.key = d.key;
      this.maxHp = d.hp;
      this.sprite = imgOf(d.key);
      this.r = d.r;
      this.hit = Math.round(this.r * CFG.HIT_SCALE);
      this.hp = d.hp;
      this.color = d.color;
      if (MODE === 'survival') {
        const sc = survScale();
        this.maxHp = Math.round(this.maxHp * (sc.hp*1.25));
        this.hp = this.maxHp;
        this.fireCd = Math.max(0.35, this.fireCd / (sc.fire*0.9));
      }

      this.t = 0;
      this.dead = false;

      this.vx = 70;

      this.state = 'move'; 
      this.stateT = 0;
      this.chargeV = 520;

      this.fireCd = 0.9;
    }

    update(dt) {
      this.t += dt;

      if (this.type === 'mimic') {

        this.x += this.vx * dt;
        if (this.x < this.r || this.x > W - this.r) this.vx *= -1;

        this.fireCd -= dt;
        if (this.fireCd <= 0) {
          for (let i = -2; i <= 2; i++) {
            enemyBullets.push(new EnemyBullet(this.x + i * 14, this.y + this.r - 10, 0, 180 + Math.abs(i) * 30, { r:3 }));
          }
          this.fireCd = 0.55;
        }
        return;
      }

      if (this.type === 'minotaur') {

        if (this.state === 'move') {
          const targetX = player?.x ?? (W/2);
          this.x += Math.sign(targetX - this.x) * 120 * dt;

          this.y = 110 + Math.sin(this.t * 1.6) * 10;

          this.fireCd -= dt;
          if (this.fireCd <= 0) {
            this.state = 'windup';
            this.stateT = 0.35;
            this.fireCd = 1.6;
          }
        } else if (this.state === 'windup') {
          this.stateT -= dt;

          this.x += Math.sin(this.t * 30) * 0.8;
          if (this.stateT <= 0) {
            this.state = 'charge';
            this.stateT = 0.55;

            const tx = player?.x ?? (W/2);
            this.vx = Math.sign(tx - this.x) * this.chargeV;
          }
        } else if (this.state === 'charge') {
          this.stateT -= dt;
          this.x += this.vx * dt;

          if (this.x < this.r) { this.x = this.r; this.vx *= -1; }
          if (this.x > W - this.r) { this.x = W - this.r; this.vx *= -1; }

          if (this.stateT <= 0) {
            this.state = 'recover';
            this.stateT = 0.35;

            const baseVy = 220;
            const spread = 140;
            enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 6, 0, baseVy, { r:4 }));
            enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 6, -spread, baseVy, { r:4 }));
            enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 6, +spread, baseVy, { r:4 }));
          }
        } else if (this.state === 'recover') {
          this.stateT -= dt;

          this.y += (100 - this.y) * 3.0 * dt;
          if (this.stateT <= 0) this.state = 'move';
        }
        return;
      }

      const speed = 90;
      this.x += Math.sin(this.t * 0.8) * speed * dt * 1.6;
      this.x = Math.max(this.r, Math.min(W - this.r, this.x));
      this.y = 95 + Math.sin(this.t * 1.1) * 12;

      this.fireCd -= dt;
      if (this.fireCd <= 0) {

        if (Math.floor(this.t * 1.2) % 2 === 0) {

          const tx = player?.x ?? (W/2);
          const ty = player?.y ?? (H-60);
          const dx = tx - this.x, dy = ty - this.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          const vx = (dx / len) * 220;
          const vy = (dy / len) * 220;
          enemyBullets.push(new EnemyBullet(this.x - 10, this.y + this.r - 10, vx, vy, { r:3 }));
          enemyBullets.push(new EnemyBullet(this.x + 10, this.y + this.r - 10, vx, vy, { r:3 }));
          this.fireCd = 0.9;
        } else {

          const sp = 200;
          for (let i=0;i<8;i++){
            const a = (Math.PI*2) * (i/8);
            enemyBullets.push(new EnemyBullet(this.x, this.y + this.r - 8, Math.cos(a)*sp, Math.sin(a)*sp, { r:3, life:1.6 }));
          }
          this.fireCd = 1.3;
        }
      }
    }

  
    render(){

      drawSpriteOrCircle(this.sprite, this.x, this.y, this.r, this.color);}
}

  let player;
  const playerBullets = [];
  const enemies = [];
  const enemyBullets = [];
  const stars = [];
  const effects = []; 

  let time = 0;
  let score = 0;
  let gameOver = false;
  let bossSpawned = false;
  let spawnTimer = CFG.SPAWN_INTERVAL;

  let survT = 0;
  let survWave = 1;
  let nextWaveAt = 20;
  let nextBossAt = 45;
  let bossIdx = 0;

  function survScale(){
    const w = Math.max(1, survWave);
    return {
      spawn: Math.max(0.26, 1.05 - (w-1)*0.06),
      hp: 1.0 + (w-1)*0.10,
      spd: 1.0 + (w-1)*0.04,
      fire: 1.0 + (w-1)*0.06,
      bullet: 1.0 + (w-1)*0.05,
    };
  }

  

let waveText = '';
let waveT = 0; 
function showWave(text, sec = 1.2){
  waveText = text;
  waveT = sec;
}

  function effectiveInterval(base, lv){
    const mul = 1 - Math.min(0.35, (lv-1)*0.08);
    return Math.max(0.06, base * mul);
  }

  function spawnExplosion(x, y, r, damage) {
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx*dx + dy*dy <= r*r) {
        e.hp -= damage;
        if (e.hp <= 0) { e.dead = true; score += (e instanceof Boss) ? 200 : 40; const id = (e instanceof Boss) ? `boss.${e.type}` : e.key; recordKill(id); rollDrops(id); }
      }
    }
    effects.push(new ExplosionFx(x, y, r));
  }

  function fireWeapon(p) {
    const w = p.weapon || WEAPONS.pulse;
    const lv = p.weaponLv ?? 1;

    const dmg = (w.damage ?? 1) + (lv - 1) * 0.4;

    if (w === WEAPONS.pulse || w.name === 'Pulse') {
      const spd = (w.bulletSpeed ?? 8) * 65; 
      const spriteKey='bullet.pulse';
      const shots = (lv>=5)?4:(lv>=3)?3:(lv>=2)?2:1;
      const spread = (shots===1)?0:0.12; 
      for(let i=0;i<shots;i++){
        const t = (shots===1)?0:(i/(shots-1)-0.5);
        const ang = t*spread*2;
        const vx = Math.sin(ang)*spd;
        const vy = -Math.cos(ang)*spd;
        playerBullets.push(new PlayerBullet(p.x, p.y - p.r - 6, vx, vy, { damage: dmg, r: 3, pierce: lv>=4, spriteKey }));
      }
      return;
    }

    if (w === WEAPONS.scatter || w.name === 'Scatter') {
      const spd = (w.bulletSpeed ?? 8) * 60;
      const baseN = w.pellet ?? 3;
      const n = baseN + (lv-1)*2;
      const spread = w.spread ?? 0.25; 
      for (let i = 0; i < n; i++) {
        const t = (n === 1) ? 0 : (i / (n - 1) - 0.5);
        const ang = t * spread * 2;
        const vx = Math.sin(ang) * spd;
        const vy = -Math.cos(ang) * spd;
        playerBullets.push(new PlayerBullet(p.x, p.y - p.r - 6, vx, vy, { damage: dmg, r: 3, spriteKey:'bullet.scatter' }));
      }
      return;
    }

    const spd = (w.bulletSpeed ?? 4) * 55;
    const ttl = w.ttl ?? 90;
    const explodeRadius = w.explodeRadius ?? 48;
    playerBullets.push(new MissileBullet(
      p.x, p.y - p.r - 6,
      0, -spd,
      { damage: dmg * 1.3, r: 5, ttl, explodeRadius: explodeRadius + (lv>=4?18:0), homing: (lv>=3?0.8:0), cluster: (lv>=5?3:0), spriteKey:'bullet.missile' }
    ));
  }

  function survivalPool(){
    if (MODE !== 'survival') return ENEMY_KEYS;
    const w = survWave;
    if (w <= 2) return STAGE_POOLS[1];
    if (w <= 5) return Array.from(new Set([].concat(STAGE_POOLS[1], STAGE_POOLS[2])));
    return SURVIVAL_POOL;
  }

  function spawnEnemy() {
    const x = 40 + Math.random() * (W - 80);
    const y = -20;
    const pool = survivalPool();
    const key = pool[Math.floor(Math.random() * pool.length)];
    recordSeen(key);
    enemies.push(new Enemy(x, y, key));
  }

  function spawnBoss(forcedType=null) {
    let bossType;
    if (forcedType) bossType = forcedType;
    else bossType = (STAGE === 1) ? 'mimic' : (STAGE === 2) ? 'minotaur' : 'angel';
    recordSeen(`boss.${bossType}`);
    enemies.push(new Boss(W / 2, 100, bossType));
    bossSpawned = true;
    showWave(`BOSS: ${bossType.toUpperCase()}`, 1.0);
  }

  
  const CODEX_KEY = 'codex';
  function loadCodex(){
    try { return JSON.parse(localStorage.getItem(CODEX_KEY)) ?? { enemies:{}, items:{}, weapons:{}, ships:{} }; }
    catch { return { enemies:{}, items:{}, weapons:{}, ships:{} }; }
  }
  function saveCodex(c){ localStorage.setItem(CODEX_KEY, JSON.stringify(c)); }
  function recordSeen(id){
    const c = loadCodex();
    c.enemies = c.enemies ?? {};
    const e = c.enemies[id] ?? { discoveredAt: Date.now(), seen:0, kills:0 };
    e.seen = (e.seen ?? 0) + 1;
    if (!e.discoveredAt) e.discoveredAt = Date.now();
    c.enemies[id] = e;
    saveCodex(c);
  }
  function recordKill(id){
    const c = loadCodex();
    c.enemies = c.enemies ?? {};
    const e = c.enemies[id] ?? { discoveredAt: Date.now(), seen:0, kills:0 };
    e.kills = (e.kills ?? 0) + 1;
    if (!e.discoveredAt) e.discoveredAt = Date.now();
    c.enemies[id] = e;
    saveCodex(c);
  }

const INV_KEY = 'inventory';
function loadInv(){
  try { return JSON.parse(localStorage.getItem(INV_KEY)) ?? {}; } catch { return {}; }
}
function saveInv(inv){ localStorage.setItem(INV_KEY, JSON.stringify(inv)); }
function addMat(key, n){
  const inv = loadInv();
  inv[key] = (inv[key] ?? 0) + n;
  saveInv(inv);
  showWave(`+${key} x${n}`, 0.9);
}

const DROP_DEF = {
  'enemy.slime_purple': { gel:[0.75, 1] },
  'enemy.hi':          { gel:[0.35, 1] },
  'enemy.ghost_black': { essence:[0.45, 1] },
  'enemy.ghost_white': { essence:[0.55, 1] },
  'enemy.ika':         { essence:[0.45, 1], gel:[0.20,1] },
  'enemy.jackolantern':{ stone:[0.35, 1], gel:[0.25,1] },
  'enemy.yeti':        { stone:[0.60, 1] },
  'enemy.gargoyle_purple': { stone:[0.35,1] },
  'enemy.gargoyle_stone': { stone:[0.45,1], essence:[0.25,1] },
  'enemy.kyuketsuki':  { essence:[0.40,1] },
  'enemy.monster_hana':{ gel:[0.35,1], essence:[0.25,1] },
  'enemy.treant':      { stone:[0.55,1], essence:[0.35,1] },
  'boss.mimic':        { core:[1.0,1], gel:[0.80,2] },
  'boss.minotaur':     { core:[1.0,1], stone:[0.80,2] },
  'boss.angel':        { core:[1.0,1], essence:[0.80,2] },
};

function rollDrops(key){
  const d = DROP_DEF[key];
  if (!d) return;
  for (const mat in d){
    const [p, n] = d[mat];
    if (Math.random() <= p) addMat(mat, n);
  }
}

function loadLoadout() {
    return JSON.parse(localStorage.getItem('loadout')) ?? {
      ship: 'striker',
      weapon: 'pulse',
      weaponLv: 1
    };
  }

  function reset(){
    const loadout = loadLoadout();
    const shipDef = SHIPS[loadout.ship] ?? SHIPS.striker;
    const weaponDef = WEAPONS[loadout.weapon] ?? WEAPONS.pulse;

    player = new Player(
      W / 2,
      H - 80,
      shipDef,
      weaponDef,
      loadout.weaponLv
    );

    playerBullets.length = 0;
    enemies.length = 0;
    enemyBullets.length = 0;
    effects.length = 0;

    time = 0;
    score = 0;
    gameOver = false;
    bossSpawned = false;
    spawnTimer = CFG.SPAWN_INTERVAL;
    if (MODE === 'survival') {
      survT = 0;
      survWave = 1;
      nextWaveAt = 20;
      nextBossAt = 45;
      bossIdx = 0;
      showWave('SURVIVAL START', 1.2);
    } else {
      showWave(`STAGE ${STAGE}`, 1.2);
    }

    stars.length = 0;
    for (let i = 0; i < CFG.STAR_COUNT; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.4 + 0.4 });
    }
  }

  function update(dt) {
    if (gameOver) return;
    time += dt;

    
    if (waveT > 0) waveT -= dt;
if (MODE === 'survival') {
      survT += dt;
      if (survT >= nextWaveAt) {
        survWave++;
        nextWaveAt += 22 + Math.min(18, survWave * 1.2);
        showWave(`WAVE ${survWave}`, 1.2);
      }
      const sc = survScale();
      spawnTimer -= dt;
      const bossAlive = enemies.some(e => (e instanceof Boss) && !e.dead);
      const spMul = bossAlive ? 1.8 : 1.0;
      if (!bossAlive && survT >= nextBossAt) {
        const types = ['mimic','minotaur','angel'];
        const t = types[bossIdx % types.length];
        bossIdx++;
        spawnBoss(t);
        nextBossAt += Math.max(38, 62 - Math.min(22, survWave*2));
      }
      if (!bossAlive && spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = sc.spawn * spMul * (0.85 + Math.random() * 0.45);
      }
    } else {
      spawnTimer -= dt;
      if (!bossSpawned && spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = CFG.SPAWN_INTERVAL * (0.85 + Math.random() * 0.4);
      }
      const bossScore = (STAGE===1)?450:(STAGE===2)?650:850;
      if (!bossSpawned && score >= bossScore) spawnBoss();
    }

    player.update(dt);
    for (const b of playerBullets) b.update(dt);
    for (const e of enemies) e.update(dt);
    for (const eb of enemyBullets) eb.update(dt);
    for (const fx of effects) fx.update(dt);

    for (const b of playerBullets) {
      if (b.dead) continue;
      for (const e of enemies) {
        if (e.dead) continue;
        if (circleHit(b.x, b.y, b.r, e.x, e.y, e.hit)) {

          if (b instanceof MissileBullet) {
            b.explode();
          } else {
            e.hp -= (b.damage ?? 1);
            if (!b.pierce) b.dead = true;
            if (e.hp <= 0) { e.dead = true; score += (e instanceof Boss) ? 200 : 40; const id = (e instanceof Boss) ? `boss.${e.type}` : e.key; recordKill(id); rollDrops(id); }
          }
          break;
        }
      }
    }

    if (!gameOver) {
      for (const eb of enemyBullets) {
        if (!eb.dead && circleHit(eb.x, eb.y, eb.r, player.x, player.y, player.hit)) {
          eb.dead = true; damagePlayer(); break;
        }
      }
      for (const e of enemies) {
        if (!e.dead && circleHit(e.x, e.y, e.hit, player.x, player.y, player.hit)) {
          e.dead = true; damagePlayer();
        }
      }
    }

    sweepDead(playerBullets);
    sweepDead(enemies);
    sweepDead(enemyBullets);
    sweepDead(effects);

    if (bossSpawned) {
      const aliveBoss = enemies.some(e => (e instanceof Boss) && !e.dead);
      if (!aliveBoss) {
        if (MODE === 'survival') {
          bossSpawned = false;
          showWave('BOSS DOWN!', 1.2);
        } else {
          endGame(true).catch(()=>{});
        }
      }
    }

    for (const s of stars) {
      s.y += (40 + s.s * 60) * dt;
      if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    }
  }

  function damagePlayer() {
    player.hp -= 1;
    if (player.hp <= 0) {
      endGame(false).catch(()=>{});
    }
  }

  function circleHit(x1,y1,r1,x2,y2,r2){
    const dx=x1-x2,dy=y1-y2;
    return dx*dx+dy*dy<= (r1+r2)*(r1+r2);
  }
  function sweepDead(arr){
    for(let i=arr.length-1;i>=0;i--) if(!arr[i] || arr[i].dead) arr.splice(i,1);
  }

  function render() {
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);

    ctx.fillStyle = '#556';
    for (const s of stars) ctx.fillRect(s.x, s.y, 2, 2);

    const _safeRender = (arr) => {
      for (const o of arr) {
        if (o && typeof o.render === 'function') o.render();
      }
    };

    _safeRender(playerBullets);
    _safeRender(enemyBullets);
    _safeRender(enemies);
    _safeRender(effects);
    player.render();

    ctx.fillStyle = '#ddd';
    ctx.font = '14px monospace';
    ctx.fillText(`HP:${player.hp}  Score:${score}  Time:${time.toFixed(1)}s`, 8, H - 8);

if (waveT > 0) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, waveT / 0.6);
  ctx.font = '20px monospace';
  ctx.fillStyle = '#fff';
  centerText(waveText, H * 0.45);
  ctx.restore();
}

if (gameOver) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#fff';
      centerText('GAME OVER', H * 0.5 - 6);
      ctx.fillStyle = '#aaa';
      centerText('Press R to Retry', H * 0.5 + 16);
    }
  }
  function centerText(text, y){
    const m=ctx.measureText(text);
    ctx.fillText(text,(W-m.width)/2,y);
  }

  let last = 0;
  function frame(ts) {
    const t = ts * 0.001;
    const dt = Math.min(0.033, t - last || 0.016);
    last = t;
    update(dt); render();
    requestAnimationFrame(frame);
  }

  async function postScore(cleared){
    const payload = {
      mode: MODE, stage: STAGE, difficulty: DIFF,
      is_clear: cleared ? 1 : 0,
      score, duration_ms: Math.floor(time*1000)
    };
    try {
      await fetch('/api/score.php', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload), credentials:'include'
      });
    } catch(_){}
  }
  
let ended = false;
function showResultOverlay(cleared){

  if (document.getElementById('resultOverlay')) return;

  const ov = document.createElement('div');
  ov.id = 'resultOverlay';
  ov.style.position = 'fixed';
  ov.style.inset = '0';
  ov.style.display = 'flex';
  ov.style.alignItems = 'center';
  ov.style.justifyContent = 'center';
  ov.style.background = 'rgba(0,0,0,0.72)';
  ov.style.zIndex = '9999';

  const card = document.createElement('div');
  card.style.width = 'min(520px, 92vw)';
  card.style.padding = '18px 18px 14px';
  card.style.border = '1px solid rgba(255,255,255,0.18)';
  card.style.borderRadius = '14px';
  card.style.background = 'rgba(20,20,20,0.92)';
  card.style.color = '#fff';
  card.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

  const title = document.createElement('div');
  title.textContent = cleared ? 'CLEAR!' : 'GAME OVER';
  title.style.fontSize = '28px';
  title.style.fontWeight = '800';
  title.style.marginBottom = '8px';

  const info = document.createElement('div');
  info.style.opacity = '0.9';
  info.style.lineHeight = '1.5';
  info.innerHTML = `STAGE: <b>${STAGE}</b><br>Score: <b>${score}</b>`;

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '10px';
  btnRow.style.marginTop = '14px';
  btnRow.style.flexWrap = 'wrap';

  function mkBtn(label, onClick){
    const b = document.createElement('button');
    b.textContent = label;
    b.style.padding = '10px 12px';
    b.style.borderRadius = '10px';
    b.style.border = '1px solid rgba(255,255,255,0.22)';
    b.style.background = 'rgba(255,255,255,0.08)';
    b.style.color = '#fff';
    b.style.cursor = 'pointer';
    b.onclick = onClick;
    return b;
  }

  btnRow.appendChild(mkBtn('ランキングへ', () => { location.href = '/ranking.html'; }));
  btnRow.appendChild(mkBtn('メニューへ',   () => { location.href = '/menu.html'; }));
  btnRow.appendChild(mkBtn('リトライ',     () => { ov.remove(); reset(); ended=false; gameOver=false; bossSpawned=false; }));

  const note = document.createElement('div');
  note.style.marginTop = '10px';
  note.style.fontSize = '12px';
  note.style.opacity = '0.7';
  note.textContent = '※ 自動でランキングへ移動します（約2秒）';

  card.appendChild(title);
  card.appendChild(info);
  card.appendChild(btnRow);
  card.appendChild(note);
  ov.appendChild(card);
  document.body.appendChild(ov);

  setTimeout(() => {

    if (document.getElementById('resultOverlay')) location.href = '/ranking.html';
  }, 2000);
}

async function endGame(cleared){
  if (ended) return;
  ended = true;
  gameOver = true;
  await postScore(!!cleared);
  showResultOverlay(!!cleared);
}

  function tryRetry(){ if (gameOver) reset(); }

  async function start(){
    await ensureAssets();     
    reset();
    showWave(`STAGE ${STAGE}`, 1.2);
    requestAnimationFrame(frame);
  }
  window.Game = Object.freeze({ start }); window.startGame = start;

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => { start(); })
    : start();
})();