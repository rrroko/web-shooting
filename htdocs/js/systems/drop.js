import { DROP_TABLE } from '../core/config.js';

export function rollDrop(key){
  const d = DROP_TABLE[key];
  if (!d) return null;
  if (Math.random() > d.chance) return null;

  const n = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
  return { item: d.item, qty: n };
}
