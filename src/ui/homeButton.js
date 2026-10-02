import { PALETTE } from '../palette.js';

const SIZE = 44; // CLAUDE.md: 터치 영역 최소 44px
const MARGIN = 6;
const DEPTH = 100000; // 월드 물체(깊이 = y좌표)보다 항상 위

// 우측 하단 🏠 "처음 위치로" 버튼. 카메라에 고정된다.
export function createHomeButton(scene, { homeX, homeY, panMs }) {
  const cam = scene.cameras.main;
  const x = cam.width - MARGIN - SIZE;
  const y = cam.height - MARGIN - SIZE;

  const g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH);
  g.fillStyle(PALETTE.buttonFill).fillRoundedRect(x, y, SIZE, SIZE, 8);
  g.lineStyle(2, PALETTE.buttonLine).strokeRoundedRect(x, y, SIZE, SIZE, 8);

  // 임시 도형 집: 지붕(삼각형) + 벽 + 문
  const cx = x + SIZE / 2;
  const cy = y + SIZE / 2;
  g.fillStyle(PALETTE.roof).fillTriangle(cx - 12, cy - 1, cx, cy - 12, cx + 12, cy - 1);
  g.fillStyle(PALETTE.wall).fillRect(cx - 9, cy - 1, 18, 13);
  g.fillStyle(PALETTE.buttonLine).fillRect(cx - 3, cy + 4, 6, 8);

  const hit = scene.add
    .zone(x, y, SIZE, SIZE)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(DEPTH + 1)
    .setInteractive({ useHandCursor: true });

  hit.on('pointerup', () => {
    cam.pan(homeX, homeY, panMs, 'Sine.easeInOut', true);
  });

  return hit;
}
