

import { imgOf } from '../engine/assets.js';

export const ENEMY_SIZE = 44;  
const TYPE_TO_SIZE = {
  slime: 40,
  bat:   36,
};
const TYPE_TO_SPRITE = {
  slime: 'enemy.slime_purple', 
  bat:   'enemy.bat_gray',

};

export class Enemy {
  constructor(x, y, type = 'slime') {
    this.x = x;
    this.y = y;
    this.type = type;

    const key = TYPE_TO_SPRITE[type] || type;  
    this.sprite = imgOf(key);

    this.size = TYPE_TO_SIZE[type] ?? ENEMY_SIZE;
    this.r = Math.floor(this.size * 0.42);     
    this.hp = 1;
  }

  render(ctx) {
    const img = this.sprite;
    if (!img) return;

    const target = this.size || ENEMY_SIZE;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    let dw = target, dh = target;
    if (iw > ih) dh = target * (ih / iw);
    else         dw = target * (iw / ih);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, this.x - dw / 2, this.y - dh / 2, dw, dh);

  }
}
