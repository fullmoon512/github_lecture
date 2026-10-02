import { PALETTE } from '../palette.js';
import { createButton, MIN_TOUCH } from './button.js';
import { DIALOG_DEPTH } from './dialog.js';
import { createItemGrid, gridSize } from './itemGrid.js';

const COLS = 5;
const PAD = 14;
const HEADER = MIN_TOUCH; // 제목 줄 = ✕ 버튼 높이
const FOOT = 28; // 이름 한 줄

// 🎒 창고 창. 가진 품목만 보인다. ✕ 또는 창 바깥을 탭하면 닫힌다
export function showStoragePopup(scene, { entries, onClose }) {
  const cam = scene.cameras.main;
  const D = DIALOG_DEPTH;
  const parts = [];
  const grid = gridSize(entries.length, COLS);
  const W = grid.width + PAD * 2;
  const H = 6 + HEADER + 8 + grid.height + FOOT + 6;
  const px = Math.round((cam.width - W) / 2);
  const py = Math.round((cam.height - H) / 2);

  // 바깥 막: 뒤쪽 입력을 막고, 여기서 누르고 떼면 닫힌다
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

  // 창 자체를 누른 건 닫기가 아니다
  parts.push(scene.add.zone(px, py, W, H).setOrigin(0).setScrollFactor(0).setDepth(D + 1).setInteractive());

  const g = scene.add.graphics().setScrollFactor(0).setDepth(D + 1);
  g.fillStyle(PALETTE.buttonFill).fillRoundedRect(px, py, W, H, 10);
  g.lineStyle(2, PALETTE.buttonLine).strokeRoundedRect(px, py, W, H, 10);
  parts.push(g);

  const text = (x, y, str, style) =>
    scene.add
      .text(x, y, str, { fontFamily: 'sans-serif', color: PALETTE.popStroke, ...style })
      .setScrollFactor(0)
      .setDepth(D + 2);

  parts.push(text(px + PAD, py + 6 + HEADER / 2, '창고', { fontSize: '14px', fontStyle: 'bold' }).setOrigin(0, 0.5));

  const closeButton = createButton(scene, px + W - 6 - MIN_TOUCH, py + 6, {
    depth: D + 2,
    draw: (bg, cx, cy) => {
      bg.lineStyle(2, PALETTE.buttonLine);
      bg.lineBetween(cx - 6, cy - 6, cx + 6, cy + 6);
      bg.lineBetween(cx - 6, cy + 6, cx + 6, cy - 6);
    },
    onTap: () => close(),
  });

  const gridY = py + 6 + HEADER + 8;
  const footY = gridY + grid.height + FOOT / 2;
  const nameText = text(cam.width / 2, footY, '칸을 누르면 이름이 보여요', {
    fontSize: '12px',
    color: PALETTE.mutedText,
  }).setOrigin(0.5);
  parts.push(nameText);

  let itemGrid = null;
  if (entries.length === 0) {
    nameText.setText('');
    parts.push(
      text(cam.width / 2, gridY + grid.height / 2, '아직 비어 있어요.\n밭에서 수확해 보세요.', {
        fontSize: '12px',
        color: PALETTE.mutedText,
        align: 'center',
      }).setOrigin(0.5),
    );
  } else {
    itemGrid = createItemGrid(scene, px + PAD, gridY, entries, {
      cols: COLS,
      depth: D + 2,
      onPick: ({ name, count }) => nameText.setText(`${name} ${count}개`).setColor(PALETTE.popStroke),
    });
  }

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    parts.forEach((o) => o.destroy());
    closeButton.destroy();
    itemGrid?.destroy();
    onClose?.();
  }
  return close;
}
