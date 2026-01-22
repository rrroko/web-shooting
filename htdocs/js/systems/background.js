

export function createStarfield(W, H, opts = {}) {
  const layerCount = opts.layerCount ?? 3;
  const starsPerLayer = opts.starsPerLayer ?? [140, 90, 60];
  const speeds = opts.speeds ?? [15, 30, 55]; 
  const sizes = opts.sizes ?? [1.0, 1.4, 2.0]; 

  const layers = [];
  for (let li = 0; li < layerCount; li++) {
    const n = starsPerLayer[li] ?? 60;
    const layer = [];
    for (let i = 0; i < n; i++) {
      layer.push({
        x: Math.random() * W,
        y: Math.random() * H,
        tw: Math.random() * 1.0,
        a: 0.35 + Math.random() * 0.55
      });
    }
    layers.push(layer);
  }

  let t = 0;

  function update(dt) {
    t += dt;
    for (let li = 0; li < layers.length; li++) {
      const sp = speeds[li] ?? 30;
      const layer = layers[li];
      for (const s of layer) {
        s.y += sp * dt;
        if (s.y > H) {
          s.y = -2;
          s.x = Math.random() * W;
          s.tw = Math.random() * 1.0;
          s.a = 0.35 + Math.random() * 0.55;
        }
      }
    }
  }

  function render(ctx) {

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05060b');
    g.addColorStop(1, '#000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (let li = 0; li < layers.length; li++) {
      const sz = sizes[li] ?? 1.5;
      const layer = layers[li];
      for (const s of layer) {
        const tw = 0.65 + 0.35 * Math.sin((t + s.tw) * 6.0);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = '#b8d2ff';
        ctx.fillRect(s.x, s.y, sz, sz);
      }
    }
    ctx.globalAlpha = 1;
  }

  return { update, render };
}
