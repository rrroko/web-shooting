export function makeInput(){
  const keys = new Set();
  const onKeyDown = (e) => keys.add(e.key.toLowerCase());
  const onKeyUp   = (e) => keys.delete(e.key.toLowerCase());

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    down(k){ return keys.has(k.toLowerCase()); },
    dispose(){
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
}
