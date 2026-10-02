import { PALETTE } from '../palette.js';
import { createButton, MIN_TOUCH } from './button.js';
import { DIALOG_DEPTH } from './dialog.js';

export const PANEL_PAD = 14;
export const PANEL_CONTENT_DEPTH = DIALOG_DEPTH + 2; // 창 안 내용물 (터치 영역은 +1)

// 화면 가운데 창 틀: 제목 + ✕. ✕ 또는 창 바깥을 탭하면 닫힌다 (창 안쪽 탭은 닫히지 않음).
// 돌려주는 값: { x, y, width } 내용 영역 왼쪽 위·너비, add(obj) 닫을 때 같이 지울 것, close()
export function openPanel(scene, { title, width, contentHeight, onClose }) {
  const cam = scene.cameras.main;
  const D = DIALOG_DEPTH;
  const parts = [];
  const W = width + PANEL_PAD * 2;
  const H = 6 + MIN_TOUCH + 8 + contentHeight + 6;
  const px = Math.round((cam.width - W) / 2);
  const py = Math.round((cam.height - H) / 2);

  const blocker = scene.add
    .zone(0, 0, cam.width, cam.height)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(D)
    .setInteractive();
  let pressedOutside = false;
  blocker.on('pointerdown', () => (pressedOutside = true));
  blocker.on('pointerup', () => {
    if (pressedOutside) close();
  });
  parts.push(blocker);
  parts.push(scene.add.zone(px, py, W, H).setOrigin(0).setScrollFactor(0).setDepth(D + 1).setInteractive());

  const g = scene.add.graphics().setScrollFactor(0).setDepth(D + 1);
  g.fillStyle(PALETTE.buttonFill).fillRoundedRect(px, py, W, H, 10);
  g.lineStyle(2, PALETTE.buttonLine).strokeRoundedRect(px, py, W, H, 10);
  parts.push(g);

  parts.push(
    scene.add
      .text(px + PANEL_PAD, py + 6 + MIN_TOUCH / 2, title, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: PALETTE.popStroke,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(PANEL_CONTENT_DEPTH),
  );

  const closeButton = createButton(scene, px + W - 6 - MIN_TOUCH, py + 6, {
    depth: PANEL_CONTENT_DEPTH,
    draw: (bg, cx, cy) => {
      bg.lineStyle(2, PALETTE.buttonLine);
      bg.lineBetween(cx - 6, cy - 6, cx + 6, cy + 6);
      bg.lineBetween(cx - 6, cy + 6, cx + 6, cy - 6);
    },
    onTap: () => close(),
  });

  const extras = [];
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    parts.forEach((o) => o.destroy());
    closeButton.destroy();
    extras.forEach((o) => o.destroy());
    onClose?.();
  }

  return {
    x: px + PANEL_PAD,
    y: py + 6 + MIN_TOUCH + 8,
    width,
    add(obj) {
      extras.push(obj);
      return obj;
    },
    close,
  };
}

// 창 안 글자 한 줄
export function panelText(scene, x, y, str, style = {}) {
  return scene.add
    .text(x, y, str, { fontFamily: 'sans-serif', fontSize: '12px', color: PALETTE.popStroke, ...style })
    .setScrollFactor(0)
    .setDepth(PANEL_CONTENT_DEPTH);
}
