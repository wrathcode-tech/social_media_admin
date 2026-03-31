import { buildStaticSeed } from './adminStaticData.js';

let state = null;

export function getStaticRuntime() {
  if (!state) state = buildStaticSeed();
  return state;
}
