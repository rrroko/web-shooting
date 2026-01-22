export const CFG = {
  W: 800,
  H: 600,

  HIT_SCALE: 0.65,

  ENEMY_BASE_VY: 70,

  OFFSCREEN_PAD: 120,
};

export const SHIPS = {
  falcon:  { name:'Falcon',  maxHp:5,  speed:5.0, fireRate:0.15, hitRadius:14, spriteKey:'player.ship_1' },
  striker: { name:'Striker', maxHp:7,  speed:4.0, fireRate:0.20, hitRadius:16, spriteKey:'player.ship_1' },
  titan:   { name:'Titan',   maxHp:10, speed:3.0, fireRate:0.30, hitRadius:18, spriteKey:'player.ship_2' },
};

export const WEAPONS = {
  pulse: {
    name:'Pulse',
    type:'single',
    bulletSpeed: 9,
    damage: 1,
    fireInterval: 0.15,
  },
  scatter: {
    name:'Scatter',
    type:'spread',
    pellet: 3,
    spreadRad: 0.22,
    bulletSpeed: 8,
    damage: 1,
    fireInterval: 0.22,
  },
  laser: {
    name:'Laser',
    type:'laser',
    damage: 2,
    fireInterval: 0.35,
    range: 520,
    width: 4,
  },
  missile: {
    name:'Missile',
    type:'missile',
    bulletSpeed: 5.2,
    damage: 2,
    explodeRadius: 48,
    ttl: 90,            
    fireInterval: 0.8,
  }
};

export const ENEMY_RADIUS = {
  'enemy.slime_purple': 14,
  'enemy.ghost_black':  12,
  'enemy.gargoyle_purple': 18,

  'enemy.bat_red': 10,
  'enemy.knight_blue': 22,
  'enemy.witch_purple': 16,

  'boss.mimic': 36,
  'boss.angel': 42,
};

export const ENEMY_KEYS = [
  'enemy.slime_purple',
  'enemy.ghost_black',
  'enemy.gargoyle_purple',
  'enemy.bat_red',
  'enemy.knight_blue',
  'enemy.witch_purple',
];

export const DROP_TABLE = {
  'enemy.slime_purple':     { item:'slime', chance:0.55, min:1, max:2 },
  'enemy.ghost_black':      { item:'ectoplasm', chance:0.45, min:1, max:1 },
  'enemy.gargoyle_purple':  { item:'stone', chance:0.50, min:1, max:2 },

  'enemy.bat_red':          { item:'wing', chance:0.60, min:1, max:2 },
  'enemy.knight_blue':      { item:'metal', chance:0.50, min:1, max:1 },
  'enemy.witch_purple':     { item:'orb', chance:0.50, min:1, max:1 },

  'boss.mimic':             { item:'mimic_core', chance:1.0, min:1, max:1 },
  'boss.angel':             { item:'halo', chance:1.0, min:1, max:1 },
};

export const DIFFICULTY = {
  easy:   { enemyHpMul: 0.85, enemySpdMul: 0.9, scoreMul: 0.9 },
  normal: { enemyHpMul: 1.0,  enemySpdMul: 1.0, scoreMul: 1.0 },
  hard:   { enemyHpMul: 1.2,  enemySpdMul: 1.12, scoreMul: 1.15 },
};
