export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

export function dist2(ax, ay, bx, by){
  const dx = ax - bx, dy = ay - by;
  return dx*dx + dy*dy;
}

export function hitCircle(ax, ay, ar, bx, by, br){
  const r = ar + br;
  return dist2(ax, ay, bx, by) <= r*r;
}

export function rand(a,b){ return a + Math.random()*(b-a); }
