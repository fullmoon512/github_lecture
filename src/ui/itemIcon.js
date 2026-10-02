import config from '../../config.json';
import { PALETTE } from '../palette.js';
import { drawCrop } from '../objects/cropLook.js';

// 품목 아이콘 (임시 도형), (cx, cy) 중심. 그림이 아직 없는 품목은 색 동그라미.
// 동물 선물(10단계) 그림은 그 단계에서 추가한다
export function drawItemIcon(g, cx, cy, id) {
  if (PALETTE.crop[id] !== undefined) {
    drawCrop(g, cx, cy + 5, id, 1);
    return;
  }
  const recipe = config.cooking.recipes[id];
  if (recipe) {
    drawFood(g, cx, cy, recipe.category, PALETTE.crop[Object.keys(recipe.inputs)[0]]);
    return;
  }
  g.fillStyle(PALETTE.itemFallback).fillCircle(cx, cy, 6);
}

// 요리: 분류별 그릇 모양 + 재료 작물 색
function drawFood(g, cx, cy, category, color) {
  if (category === 'juice') {
    // 컵
    g.fillStyle(PALETTE.glass).fillRect(cx - 5, cy - 7, 10, 14);
    g.fillStyle(color).fillRect(cx - 4, cy - 3, 8, 9);
    g.fillStyle(PALETTE.cupWhite).fillRect(cx - 4, cy - 6, 2, 3);
  } else if (category === 'jam') {
    // 뚜껑 있는 병 + 라벨
    g.fillStyle(color).fillRoundedRect(cx - 6, cy - 4, 12, 11, 2);
    g.fillStyle(PALETTE.woodDark).fillRect(cx - 5, cy - 7, 10, 3);
    g.fillStyle(PALETTE.cupWhite).fillRect(cx - 4, cy, 8, 3);
  } else if (category === 'tea') {
    // 받침 + 찻잔 + 손잡이
    g.fillStyle(PALETTE.cupLine).fillEllipse(cx, cy + 6, 18, 3);
    g.fillStyle(PALETTE.cupWhite).fillRoundedRect(cx - 6, cy - 3, 11, 8, 2);
    g.lineStyle(1, PALETTE.cupLine).strokeRoundedRect(cx - 6, cy - 3, 11, 8, 2);
    g.strokeCircle(cx + 6, cy, 2);
    g.fillStyle(color).fillRect(cx - 5, cy - 2, 9, 2);
  } else {
    g.fillStyle(color ?? PALETTE.itemFallback).fillCircle(cx, cy, 6);
  }
}
