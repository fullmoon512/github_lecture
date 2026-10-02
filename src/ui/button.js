import { PALETTE } from '../palette.js';

export const MIN_TOUCH = 44; // CLAUDE.md: 터치 영역 최소 44px
export const UI_DEPTH = 100000; // 월드 물체(깊이 = y좌표)보다 항상 위

// 화면에 고정된 버튼 (기본 44×44). draw(g, cx, cy) 로 안쪽 그림을, label 로 글자를 넣는다.
// 누르기 시작한 버튼 위에서 손을 뗄 때만 onTap (드래그가 버튼 위에서 끝나도 눌리지 않게)
export function createButton(scene, x, y, { draw, onTap, label, width = MIN_TOUCH, depth = UI_DEPTH }) {
  const h = MIN_TOUCH;
  const g = scene.add.graphics().setScrollFactor(0).setDepth(depth);
  let selected = false;

  const redraw = () => {
    g.clear();
    g.fillStyle(PALETTE.buttonFill).fillRoundedRect(x, y, width, h, 8);
    g.lineStyle(selected ? 3 : 2, selected ? PALETTE.selected : PALETTE.buttonLine);
    g.strokeRoundedRect(x, y, width, h, 8);
    draw?.(g, x + width / 2, y + h / 2);
  };
  redraw();

  const text = label
    ? scene.add
        .text(x + width / 2, y + h / 2, label, {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: PALETTE.popStroke,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(depth)
    : null;

  const hit = scene.add
    .zone(x, y, width, h)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(depth + 1)
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
    destroy() {
      g.destroy();
      text?.destroy();
      hit.destroy();
    },
  };
}
