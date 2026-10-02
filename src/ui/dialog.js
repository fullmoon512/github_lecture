import { PALETTE } from '../palette.js';
import { createButton, MIN_TOUCH, UI_DEPTH } from './button.js';

export const DIALOG_DEPTH = UI_DEPTH + 100;
const PANEL_W = 232;
const PAD = 16;
const BUTTON_W = 92;
const BUTTON_GAP = 12;

// 화면 가운데 작은 대화창. 뒤쪽 입력은 막는다. 버튼을 누르면 닫히고 onTap 실행
export function showDialog(scene, { title, body, buttons }) {
  const cam = scene.cameras.main;
  const parts = [];

  // 뒤쪽(월드·다른 버튼) 탭을 막는 투명 막
  parts.push(
    scene.add
      .zone(0, 0, cam.width, cam.height)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DIALOG_DEPTH)
      .setInteractive(),
  );

  const titleText = scene.add
    .text(cam.width / 2, 0, title, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: PALETTE.popStroke,
    })
    .setOrigin(0.5, 0);
  const bodyText = body
    ? scene.add
        .text(cam.width / 2, 0, body, {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: PALETTE.popStroke,
          align: 'center',
          wordWrap: { width: PANEL_W - PAD * 2 },
        })
        .setOrigin(0.5, 0)
    : null;

  const contentH = titleText.height + (bodyText ? 8 + bodyText.height : 0);
  const panelH = PAD + contentH + PAD + MIN_TOUCH + PAD;
  const px = (cam.width - PANEL_W) / 2;
  const py = Math.round((cam.height - panelH) / 2);

  const g = scene.add.graphics();
  g.fillStyle(PALETTE.buttonFill).fillRoundedRect(px, py, PANEL_W, panelH, 10);
  g.lineStyle(2, PALETTE.buttonLine).strokeRoundedRect(px, py, PANEL_W, panelH, 10);
  parts.push(g);

  titleText.setY(py + PAD);
  bodyText?.setY(titleText.y + titleText.height + 8);
  parts.push(titleText, ...(bodyText ? [bodyText] : []));
  g.setScrollFactor(0).setDepth(DIALOG_DEPTH + 1);
  [titleText, bodyText].forEach((o) => o?.setScrollFactor(0).setDepth(DIALOG_DEPTH + 2));

  const rowW = buttons.length * BUTTON_W + (buttons.length - 1) * BUTTON_GAP;
  const by = py + panelH - PAD - MIN_TOUCH;
  const made = buttons.map((b, k) =>
    createButton(scene, (cam.width - rowW) / 2 + k * (BUTTON_W + BUTTON_GAP), by, {
      label: b.label,
      width: BUTTON_W,
      depth: DIALOG_DEPTH + 2,
      onTap: () => {
        close();
        b.onTap?.();
      },
    }),
  );

  function close() {
    parts.forEach((o) => o.destroy());
    made.forEach((b) => b.destroy());
  }
  return close;
}
