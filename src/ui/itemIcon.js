import { PALETTE } from '../palette.js';
import { drawCrop } from '../objects/cropLook.js';

// 품목 아이콘 (임시 도형), (cx, cy) 중심. 그림이 아직 없는 품목은 색 동그라미.
// 요리(6단계)·동물 선물(10단계) 그림은 각 단계에서 추가한다
export function drawItemIcon(g, cx, cy, id) {
  if (PALETTE.crop[id] !== undefined) {
    drawCrop(g, cx, cy + 5, id, 1);
    return;
  }
  g.fillStyle(PALETTE.itemFallback).fillCircle(cx, cy, 6);
}
