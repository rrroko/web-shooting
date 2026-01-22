let MANIFEST = null;
export const Assets = { images: {} };

export async function ensureAssets(){
  if (MANIFEST) return;

  try {
    const res = await fetch('/assets/manifest.json', { cache:'no-store' });
    if (!res.ok) throw new Error('manifest fetch failed: ' + res.status);
    MANIFEST = await res.json();
  } catch (e) {
    console.error('[ensureAssets] failed to load manifest.json', e);
    MANIFEST = {}; 
  }

  for (const [key, src] of Object.entries(MANIFEST)) {
    const im = new Image();
    im.src = src;
    Assets.images[key] = im;
  }
}

export function imgOf(key){
  return Assets.images?.[key] ?? null;
}
