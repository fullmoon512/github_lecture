import { PALETTE } from '../palette.js';

export const MIN_TOUCH = 44; // CLAUDE.md: 터치 영역 최소 44px
export const UI_DEPTH = 100000; // 월드 물체(깊이 = y좌표)보다 항상 위

// 화면에 고정된 정사각 버튼. draw(g, cx, cy) 로 안쪽 그림을 그린다.
// 누르기 시작한 버튼 위에서 손을 뗄 때만 onTap (드래그가 버튼 위에서 끝나도 눌리지 않게)
export function createButton(scene, x, y, { draw, onTap, label }) {
  const size = MIN_TOUCH;
  const g = scene.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH);
  let selected = false;

  const redraw = () => {
    g.clear();
    g.fillStyle(PALETTE.buttonFill).fillRoundedRect(x, y, size, size, 8);
    g.lineStyle(selected ? 3 : 2, selected ? PALETTE.selected : PALETTE.buttonLine);
    g.strokeRoundedRect(x, y, size, size, 8);
    draw?.(g, x + size / 2, y + size / 2);
  };
  redraw();

  if (label) {
    scene.add
      .text(x + size / 2, y + size / 2, label, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: PALETTE.popStroke,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);
  }

  const hit = scene.add
    .zone(x, y, size, size)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(UI_DEPTH + 1)
    .setInteractive({ useHandCursor: true });

  let pressed = false;
  hit.on('pointerdown', () => (pressed = true));
  hit.on('pointerout', () => (pressed = false));
  hit.on('pointerup', () => {
    if (pressed) onTap();
    pressed = false;
  });

  return {
    setSelected(value) {
      selected = value;
      redraw();
    },
  };
}
