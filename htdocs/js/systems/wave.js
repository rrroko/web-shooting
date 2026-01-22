
let msg = '';
let t = 0;     

export function waveStart(text, sec = 1.4){
  msg = text;
  t = sec;
}

export function waveUpdate(dt){
  if (t > 0) t -= dt;
}

export function waveRender(ctx, W, H){
  if (t <= 0) return;

  const a = Math.min(1, t / 0.6); 
  ctx.save();
  ctx.globalAlpha = a;

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '26px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(msg, W/2, H/2);

  ctx.restore();
}
