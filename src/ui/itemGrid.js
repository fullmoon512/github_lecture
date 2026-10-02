import { PALETTE } from '../palette.js';
import { MIN_TOUCH } from './button.js';
import { drawItemIcon } from './itemIcon.js';
import { itemName } from '../data/items.js';

export const SLOT = MIN_TOUCH;
export const SLOT_GAP = 6;

export function gridSize(count, cols) {
  const rows = Math.max(1, Math.ceil(count / cols));
  return {
    width: cols * SLOT + (cols - 1) * SLOT_GAP,
    height: rows * SLOT + (rows - 1) * SLOT_GAP,
  };
}

// 품목 칸 목록. 칸을 탭하면 그 칸이 강조되고 onPick({ id, count, name }).
// 창고(5단계)에서는 이름 보기, 먹이자리(7단계)에서는 음식 고르기에 쓴다
export function createItemGrid(scene, x, y, entries, { cols, depth, onPick }) {
  const g = scene.add.graphics().setScrollFactor(0).setDepth(depth);
  const parts = [g];
  let selectedId = null;

  const slots = entries.map((entry, k) => ({
    entry,
    sx: x + (k % cols) * (SLOT + SLOT_GAP),
    sy: y + Math.floor(k / cols) * (SLOT + SLOT_GAP),
  }));

  const draw = () => {
    g.clear();
    for (const { entry, sx, sy } of slots) {
      const selected = entry.id === selectedId;
      g.fillStyle(PALETTE.slotFill).fillRoundedRect(sx, sy, SLOT, SLOT, 6);
      g.lineStyle(selected ? 2 : 1, selected ? PALETTE.selected : PALETTE.slotLine);
      g.strokeRoundedRect(sx, sy, SLOT, SLOT, 6);
      drawItemIcon(g, sx + SLOT / 2, sy + SLOT / 2 - 3, entry.id);
    }
  };
  draw();

  for (const { entry, sx, sy } of slots) {
    parts.push(
      scene.add
        .text(sx + SLOT - 4, sy + SLOT - 3, String(entry.count), {
          fontFamily: 'sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: PALETTE.popStroke,
          stroke: PALETTE.popText,
          strokeThickness: 2,
        })
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(depth),
    );

    const hit = scene.add
      .zone(sx, sy, SLOT, SLOT)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(depth + 1)
      .setInteractive({ useHandCursor: true });
    let pressed = false;
    hit.on('pointerdown', () => (pressed = true));
    hit.on('pointerout', () => (pressed = false));
    hit.on('pointerup', () => {
      if (!pressed) return;
      pressed = false;
      selectedId = entry.id;
      draw();
      onPick?.({ ...entry, name: itemName(entry.id) });
    });
    parts.push(hit);
  }

  return {
    destroy: () => parts.forEach((o) => o.destroy()),
  };
}
