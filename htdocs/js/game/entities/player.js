

import { imgOf } from '../engine/assets.js';

export const PLAYER_SIZE = 44; 

export class Player {
  constructor(x, y, shipKey = 'player.ship_1') {
    this.x = x;
    this.y = y;
    this.sprite = imgOf(shipKey);
    this.size = PLAYER_SIZE;                   
    this.r = Math.floor(this.size * 0.42);     
    this.hp = 3;
  }

  render(ctx) {
    const img = this.sprite;
    if (!img) return;

    const target = this.size || PLAYER_SIZE;   
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    let dw = target, dh = target;              
    if (iw > ih) dh = target * (ih / iw);
    else         dw = target * (iw / ih);

    ctx.imageSmoothingEnabled = false;         
    ctx.drawImage(img, this.x - dw / 2, this.y - dh / 2, dw, dh);

  }
}
