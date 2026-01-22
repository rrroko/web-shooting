
export const STAGE1 = [
  [ 1.0, 'enemy.slime_purple' ],
  [ 2.0, 'enemy.slime_purple' ],
  [ 6.0, 'enemy.ghost_black' ],
  [ 12.0, 'enemy.slime_purple' ],
  [ 20.0, 'boss.mimic' ],
];

export const STAGE2 = [
  [ 1.0,  'enemy.slime_purple' ],
  [ 3.0,  'enemy.gargoyle_purple' ],
  [ 6.0,  'enemy.ghost_black' ],
  [ 10.0, 'enemy.gargoyle_purple' ],
  [ 18.0, 'boss.mimic' ],
];

export const STAGE3 = [
  [ 1.0,  'enemy.bat_red' ],
  [ 2.2,  'enemy.bat_red' ],
  [ 6.0,  'enemy.knight_blue' ],
  [ 9.0,  'enemy.witch_purple' ],
  [ 12.0, 'enemy.bat_red' ],
  [ 16.0, 'enemy.witch_purple' ],
  [ 22.0, 'boss.angel' ],
];

export function buildStageEvents(stage){
  if (stage === 1) return STAGE1;
  if (stage === 2) return STAGE2;
  if (stage === 3) return STAGE3;
  return STAGE1;
}
