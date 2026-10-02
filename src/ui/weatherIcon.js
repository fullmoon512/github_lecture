import { PALETTE } from '../palette.js';

// 날씨 아이콘 (임시 도형). (cx, cy) 중심, 약 16px 크기
export function drawWeather(g, cx, cy, weather) {
  if (weather === 'sunny') {
    g.fillStyle(PALETTE.sun).fillCircle(cx, cy, 4);
    g.fillRect(cx - 1, cy - 8, 2, 3);
    g.fillRect(cx - 1, cy + 5, 2, 3);
    g.fillRect(cx - 8, cy - 1, 3, 2);
    g.fillRect(cx + 5, cy - 1, 3, 2);
    return;
  }
  const oy = weather === 'rain' ? -3 : 0;
  g.fillStyle(PALETTE.cloud);
  g.fillCircle(cx - 3, cy + 1 + oy, 4);
  g.fillCircle(cx + 2, cy - 1 + oy, 5);
  g.fillRect(cx - 6, cy + 1 + oy, 13, 4);
  g.lineStyle(1, PALETTE.cloudLine).lineBetween(cx - 6, cy + 5 + oy, cx + 7, cy + 5 + oy);
  if (weather === 'rain') {
    g.fillStyle(PALETTE.rain);
    g.fillRect(cx - 4, cy + 5, 1, 3);
    g.fillRect(cx, cy + 6, 1, 3);
    g.fillRect(cx + 4, cy + 5, 1, 3);
  }
}
