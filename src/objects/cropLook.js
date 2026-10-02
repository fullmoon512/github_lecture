import { PALETTE } from '../palette.js';

// 작물 그림 (임시 도형). (cx, by) 는 작물이 땅에 닿는 지점, progress 0~1 (1 = 다 자람)
export function drawCrop(g, cx, by, cropId, progress) {
  if (progress <= 0) {
    // 막 심음: 흙 둔덕 + 작은 싹
    g.fillStyle(PALETTE.soilDryLine).fillRect(cx - 3, by - 1, 6, 2);
    g.fillStyle(PALETTE.sprout).fillRect(cx, by - 3, 1, 2);
    return;
  }
  if (progress < 1) {
    // 자라는 중: 줄기와 잎 두 장이 점점 커진다
    const h = 3 + Math.round(6 * progress);
    g.fillStyle(PALETTE.sprout).fillRect(cx, by - h, 1, h);
    const leaf = 1 + Math.round(2 * progress);
    g.fillRect(cx - leaf, by - h + 1, leaf, 2);
    g.fillRect(cx + 1, by - h + 2, leaf, 2);
    return;
  }

  const color = PALETTE.crop[cropId];
  if (cropId === 'carrot') {
    g.fillStyle(PALETTE.leaf);
    g.fillRect(cx - 3, by - 10, 2, 8);
    g.fillRect(cx, by - 12, 2, 10);
    g.fillRect(cx + 3, by - 9, 2, 7);
    g.fillStyle(color).fillEllipse(cx + 1, by, 10, 5);
  } else if (cropId === 'tomato') {
    g.fillStyle(PALETTE.leaf).fillRect(cx, by - 13, 1, 13);
    g.fillRect(cx - 3, by - 10, 3, 2);
    g.fillRect(cx + 1, by - 7, 3, 2);
    g.fillStyle(color);
    g.fillCircle(cx - 3, by - 6, 2.5);
    g.fillCircle(cx + 3, by - 3, 2.5);
    g.fillCircle(cx - 1, by - 1, 2.5);
  } else {
    // 허브 등: 둥근 덤불
    g.fillStyle(color);
    g.fillCircle(cx - 4, by - 3, 4);
    g.fillCircle(cx + 4, by - 3, 4);
    g.fillCircle(cx, by - 7, 4);
  }
}
