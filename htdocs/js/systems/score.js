export function makeScore(){
  let score = 0;
  return {
    add(v){ score += v; },
    get(){ return score; }
  };
}

export async function postScore(payload){
  try {
    const res = await fetch('/api/score.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch {
    return null;
  }
}
