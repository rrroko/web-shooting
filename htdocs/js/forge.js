

const LOADOUT_KEY = 'loadout';
const INV_KEY = 'inventory';

function loadJSON(key, def){
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}
function saveJSON(key, val){
  localStorage.setItem(key, JSON.stringify(val));
}

const RECIPES = {
  pulse: {
    2:{ gel:3 },
    3:{ gel:6, essence:2 },
    4:{ gel:10, essence:6, core:1 },
    5:{ gel:16, essence:10, core:2 }
  },
  scatter: {
    2:{ essence:3 },
    3:{ essence:6, gel:2 },
    4:{ essence:10, stone:6, core:1 },
    5:{ essence:16, stone:10, core:2 }
  },
  missile: {
    2:{ stone:3 },
    3:{ stone:6, gel:2 },
    4:{ stone:10, essence:6, core:1 },
    5:{ stone:16, essence:10, core:2 }
  }
};

function canCraft(inv, cost){
  for (const k in cost){
    if ((inv[k] ?? 0) < cost[k]) return false;
  }
  return true;
}

function consume(inv, cost){
  for (const k in cost){
    inv[k] -= cost[k];
  }
}

function render(){
  const loadout = loadJSON(LOADOUT_KEY, { ship:'striker', weapon:'pulse', weaponLv:1 });
  const inv = loadJSON(INV_KEY, {});

  const weapon = loadout.weapon || 'pulse';
  const lv = loadout.weaponLv || 1;

  const status = document.getElementById('status');
  status.textContent = `現在のロードアウト: ship=${loadout.ship}  weapon=${weapon}  Lv=${lv}\n素材: gel=${inv.gel??0} essence=${inv.essence??0} stone=${inv.stone??0} core=${inv.core??0}`;

  const root = document.getElementById('weapon-upgrade');
  root.innerHTML = '';

  if (lv >= 5){
    const box = document.createElement('div');
    box.className = 'box';
    box.textContent = 'この武器は最大Lvです';
    root.appendChild(box);
    return;
  }

  const nextLv = lv + 1;
  const recipe = RECIPES[weapon]?.[nextLv];
  if (!recipe){
    const box = document.createElement('div');
    box.className = 'box';
    box.textContent = '強化レシピがありません';
    root.appendChild(box);
    return;
  }

  const costText = Object.entries(recipe).map(([k,v])=>`${k}x${v}`).join(' / ');

  const box = document.createElement('div');
  box.className = 'box';

  const btn = document.createElement('button');
  btn.textContent = `Lv${nextLv} に強化（${costText}）`;
  btn.disabled = !canCraft(inv, recipe);

  btn.onclick = () => {
    consume(inv, recipe);
    loadout.weaponLv = nextLv;
    saveJSON(INV_KEY, inv);
    saveJSON(LOADOUT_KEY, loadout);
    render();
  };

  box.appendChild(btn);
  root.appendChild(box);
}

render();
