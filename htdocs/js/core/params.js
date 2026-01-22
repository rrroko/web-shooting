export function param(name, def=null){
  return new URLSearchParams(location.search).get(name) ?? def;
}

export const MODE = param('mode', 'story');                 
export const STAGE = parseInt(param('stage', '1'), 10);     
export const DIFF  = param('difficulty', 'normal');         
