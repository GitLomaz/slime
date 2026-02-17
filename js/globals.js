const WATER = 0;
const LAND = 50;

const PRESETS = [
  { name: "16:9",  w: 720, h: 1280 }, // 0.5625
  { name: "18:9",  w: 720, h: 1440 }, // 0.5
  { name: "19.5:9", w: 720, h: 1560 }, // ~0.4615 (close to Pixel 7 Pro)
  { name: "2:3",   w: 720, h: 1080 }, // 0.6667 (your current)
];

function pickPresetForParent(parentW, parentH) {
  const parentAR = parentW / parentH;

  let best = PRESETS[0];
  let bestDiff = Infinity;

  for (const p of PRESETS) {
    const ar = p.w / p.h;
    const diff = Math.abs(ar - parentAR);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }
  return best;
}

const GAME_WIDTH = 720;
const GAME_HEIGHT = 1600;
const DEBUG = false;
let scene;