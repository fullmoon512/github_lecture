import { PALETTE } from '../palette.js';
import { openPanel, panelText } from './panel.js';
import { createItemGrid, gridSize } from './itemGrid.js';

const COLS = 5;
const FOOT = 28; // 이름 한 줄

// 🎒 창고 창. 가진 품목만 보인다. ✕ 또는 창 바깥을 탭하면 닫힌다
export function showStoragePopup(scene, { entries, onClose }) {
  const grid = gridSize(entries.length, COLS);
  const panel = openPanel(scene, {
    title: '창고',
    width: grid.width,
    contentHeight: grid.height + FOOT,
    onClose,
  });
  const cx = panel.x + panel.width / 2;

  const nameText = panel.add(
    panelText(scene, cx, panel.y + grid.height + FOOT / 2, '칸을 누르면 이름이 보여요', {
      color: PALETTE.mutedText,
    }).setOrigin(0.5),
  );

  if (entries.length === 0) {
    nameText.setText('');
    panel.add(
      panelText(scene, cx, panel.y + grid.height / 2, '아직 비어 있어요.\n밭에서 수확해 보세요.', {
        color: PALETTE.mutedText,
        align: 'center',
      }).setOrigin(0.5),
    );
    return panel.close;
  }

  panel.add(
    createItemGrid(scene, panel.x, panel.y, entries, {
      cols: COLS,
      depth: nameText.depth,
      onPick: ({ name, count }) => nameText.setText(`${name} ${count}개`).setColor(PALETTE.popStroke),
    }),
  );
  return panel.close;
}
