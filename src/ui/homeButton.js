import { PALETTE } from '../palette.js';
import { createButton, MIN_TOUCH } from './button.js';

const MARGIN = 6;

// 우측 하단 🏠 "처음 위치로" 버튼. 카메라에 고정된다.
export function createHomeButton(scene, { homeX, homeY, panMs }) {
  const cam = scene.cameras.main;
  return createButton(scene, cam.width - MARGIN - MIN_TOUCH, cam.height - MARGIN - MIN_TOUCH, {
    // 임시 도형 집: 지붕(삼각형) + 벽 + 문
    draw: (g, cx, cy) => {
      g.fillStyle(PALETTE.roof).fillTriangle(cx - 12, cy - 1, cx, cy - 12, cx + 12, cy - 1);
      g.fillStyle(PALETTE.wall).fillRect(cx - 9, cy - 1, 18, 13);
      g.fillStyle(PALETTE.buttonLine).fillRect(cx - 3, cy + 4, 6, 8);
    },
    onTap: () => cam.pan(homeX, homeY, panMs, 'Sine.easeInOut', true),
  });
}
