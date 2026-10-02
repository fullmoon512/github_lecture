import { PALETTE } from '../palette.js';
import { createButton, MIN_TOUCH } from './button.js';
import { openPanel, panelText, PANEL_CONTENT_DEPTH } from './panel.js';
import { createItemGrid, gridSize } from './itemGrid.js';
import { itemName } from '../data/items.js';

const COLS = 5;
const TOP = MIN_TOUCH + 8; // "지금 올려 둔 음식" 줄
const BUTTON_W = 72;

// 먹이자리 음식 고르기. 창고에 있는 음식만 보이고, 고르면 창이 닫히고 onPick(id).
// 이미 음식이 있으면 위에 보여주고 [내리기] → onRemove()
export function showFeedPopup(scene, { current, foods, onPick, onRemove, onClose }) {
  const grid = gridSize(foods.length, COLS);
  const panel = openPanel(scene, {
    title: '먹이자리',
    width: grid.width,
    contentHeight: TOP + grid.height,
    onClose,
  });
  const cy = panel.y + MIN_TOUCH / 2;

  panel.add(
    panelText(scene, panel.x, cy, current ? `지금 올려 둔 음식: ${itemName(current)}` : '아직 아무것도 없어요', {
      color: current ? PALETTE.popStroke : PALETTE.mutedText,
    }).setOrigin(0, 0.5),
  );
  if (current) {
    panel.add(
      createButton(scene, panel.x + panel.width - BUTTON_W, panel.y, {
        label: '내리기',
        width: BUTTON_W,
        depth: PANEL_CONTENT_DEPTH,
        onTap: () => {
          panel.close();
          onRemove();
        },
      }),
    );
  }

  const gy = panel.y + TOP;
  if (foods.length === 0) {
    panel.add(
      panelText(scene, panel.x + panel.width / 2, gy + grid.height / 2, '올릴 음식이 없어요.\n수확하거나 요리해 보세요.', {
        color: PALETTE.mutedText,
        align: 'center',
      }).setOrigin(0.5),
    );
    return panel.close;
  }

  panel.add(
    createItemGrid(scene, panel.x, gy, foods, {
      cols: COLS,
      depth: PANEL_CONTENT_DEPTH,
      onPick: ({ id }) => {
        panel.close();
        onPick(id);
      },
    }),
  );
  return panel.close;
}
