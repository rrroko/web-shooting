export function bindHud(){
  const hpEl = document.getElementById('hp');
  const scEl = document.getElementById('score');
  const msgEl = document.getElementById('msg');

  return {
    setHp(v){ if (hpEl) hpEl.textContent = String(v); },
    setScore(v){ if (scEl) scEl.textContent = String(v); },
    setMsg(t){ if (msgEl) msgEl.textContent = t ?? ''; },
  };
}
