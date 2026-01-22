

const CODEX_KEY = 'codex';

function loadCodex(){
  try {
    return JSON.parse(localStorage.getItem(CODEX_KEY)) ?? { enemies:{}, items:{}, weapons:{}, ships:{} };
  } catch {
    return { enemies:{}, items:{}, weapons:{}, ships:{} };
  }
}

let manifest = null;
async function ensureManifest(){
  if (manifest) return manifest;
  manifest = await (await fetch('/assets/manifest.json', {cache:'no-store'})).json();
  return manifest;
}

const MASTER = {
  enemies: [

    { id:'enemy.slime_purple',      name:'スライム（紫）', desc:'直進。下方向単発。', iconKey:'enemy.slime_purple' },
    { id:'enemy.ghost_black',       name:'ゴースト（黒）', desc:'ジグザグ接近。追尾弾で圧。', iconKey:'enemy.ghost_black' },
    { id:'enemy.ghost_white',       name:'ゴースト（白）', desc:'ホバー移動。狙い2連。', iconKey:'enemy.ghost_white' },
    { id:'enemy.gargoyle_purple',   name:'ガーゴイル（紫）', desc:'硬め。2発バースト。', iconKey:'enemy.gargoyle_purple' },
    { id:'enemy.gargoyle_stone',    name:'ガーゴイル（石）', desc:'重装。狙い3way（狭角）。', iconKey:'enemy.gargoyle_stone' },
    { id:'enemy.hi',               name:'ヒ（高速）', desc:'急降下で突っ込む。射撃なし。', iconKey:'enemy.hi' },
    { id:'enemy.ika',              name:'イカ', desc:'波移動。波打つ3way。', iconKey:'enemy.ika' },
    { id:'enemy.jackolantern',      name:'ジャック', desc:'止まって撃つ。反射付き扇状5連。', iconKey:'enemy.jackolantern' },
    { id:'enemy.yeti',             name:'イエティ', desc:'鈍足タンク。地雷2連投下。', iconKey:'enemy.yeti' },
    { id:'enemy.kyuketsuki',        name:'吸血鬼', desc:'横追尾。追尾2連で詰める。', iconKey:'enemy.kyuketsuki' },
    { id:'enemy.monster_hana',      name:'花モンスター', desc:'ゆっくり波移動。波弾ペア。', iconKey:'enemy.monster_hana' },
    { id:'enemy.treant',            name:'トレント', desc:'巨大。8方向→中心へ収束する弾。', iconKey:'enemy.treant' },
    { id:'boss.mimic',              name:'ミミック（ボス）', desc:'左右移動。扇状連射。', iconKey:'boss.mimic' },
    { id:'boss.minotaur',           name:'ミノタウロス（ボス）', desc:'追従→溜め→突進。突進後3way。', iconKey:'boss.minotaur' },
    { id:'boss.angel',              name:'エンジェル（ボス）', desc:'狙い2連とリング8方向を交互。', iconKey:'boss.angel' }

  ],
  items: [
    { id:'gel',     name:'ゲル', desc:'スライム系素材。', emoji:'🟣' },
    { id:'essence', name:'エッセンス', desc:'幽体の欠片。', emoji:'👻' },
    { id:'stone',   name:'ストーン', desc:'硬質素材。', emoji:'🪨' },
    { id:'core',    name:'コア', desc:'ボスの中核。', emoji:'💠' }
  ],
  weapons: [
    { id:'pulse',   name:'Pulse', desc:'単発の安定武器。', emoji:'🔫' },
    { id:'scatter', name:'Scatter', desc:'散弾。', emoji:'🧨' },
    { id:'missile', name:'Missile', desc:'爆発で範囲攻撃。', emoji:'🚀' }
  ],
  ships: [
    { id:'falcon',  name:'Falcon', desc:'速い / HP低め。', iconKey:'player.ship_1' },
    { id:'striker', name:'Striker', desc:'バランス。', iconKey:'player.ship_1' },
    { id:'titan',   name:'Titan', desc:'遅い / HP高め。', iconKey:'player.ship_2' }
  ]
};

let tab = 'enemies';

function fmtDate(ms){
  if (!ms) return '';
  try { return new Date(ms).toLocaleString(); }
  catch { return ''; }
}

async function render(){
  const codex = loadCodex();
  const root = document.getElementById('content');
  root.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'grid';

  const mani = await ensureManifest();

  for (const m of MASTER[tab]){
    const e = (codex[tab] && codex[tab][m.id]) ? codex[tab][m.id] : null;
    const locked = !e;

    let iconHtml = '';
    if (locked) {
      iconHtml = `<div class="ph"></div>`;
    } else if (m.iconKey && mani[m.iconKey]) {
      iconHtml = `<img class="ico" src="${mani[m.iconKey]}" alt="${m.name}">`;
    } else if (m.emoji) {
      iconHtml = `<div class="emo">${m.emoji}</div>`;
    } else {
      iconHtml = `<div class="ph"></div>`;
    }

    let stat = '';
    if (!locked) {
      if (tab === 'enemies') stat = `遭遇:${e.seen??0} / 撃破:${e.kills??0}`;
      if (tab === 'items')  stat = `入手:${e.obtained??0}`;
      if (tab === 'weapons')stat = `選択:${e.seen??0}`;
      if (tab === 'ships')  stat = `選択:${e.seen??0}`;
    }

    const card = document.createElement('div');
    card.className = 'card' + (locked ? ' locked' : '');
    card.innerHTML = `
      ${iconHtml}
      <div class="title">${locked ? '？？？' : m.name}</div>
      <div class="meta">${locked ? '未発見' : m.desc}</div>
      <div class="sep"></div>
      <div class="meta mono">id: ${m.id}</div>
      <div class="meta">${locked ? '' : `発見: ${fmtDate(e.discoveredAt)}`}</div>
      <div class="meta">${locked ? '' : stat}</div>
    `;
    grid.appendChild(card);
  }

  root.appendChild(grid);
}

document.getElementById('tab-enemy').onclick  = () => { tab='enemies'; render(); };
document.getElementById('tab-item').onclick   = () => { tab='items'; render(); };
document.getElementById('tab-weapon').onclick = () => { tab='weapons'; render(); };
document.getElementById('tab-ship').onclick   = () => { tab='ships'; render(); };
document.getElementById('btn-back').onclick   = () => location.href='/menu.html';
document.getElementById('btn-forge').onclick  = () => location.href='/forge.html';

render();
