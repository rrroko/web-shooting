export function showResult(hud, { clear, score }){
  hud.setMsg(clear ? `CLEAR! score=${score}` : `GAME OVER score=${score}`);
}
