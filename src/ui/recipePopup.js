import { PALETTE } from '../palette.js';
import { MIN_TOUCH } from './button.js';
import { openPanel, panelText, PANEL_CONTENT_DEPTH } from './panel.js';
import { drawItemIcon } from './itemIcon.js';
import { itemName } from '../data/items.js';

const WIDTH = 236;
const ROW_H = MIN_TOUCH;
const ROW_GAP = 6;
const DIM = 0.4;

// 조리대 요리 고르기. 한 줄에 요리 하나. 재료가 모자란 요리는 흐리게, 눌러도 안 된다.
// 고르면 창이 닫히고 onPick(recipe)
export function showRecipePopup(scene, { recipes, inventory, onPick, onClose }) {
  const n = Math.max(recipes.length, 1);
  const panel = openPanel(scene, {
    title: '조리대',
    width: WIDTH,
    contentHeight: n * ROW_H + (n - 1) * ROW_GAP,
    onClose,
  });

  recipes.forEach((recipe, k) => {
    const x = panel.x;
    const y = panel.y + k * (ROW_H + ROW_GAP);
    const ok = inventory.has(recipe.inputs);
    const alpha = ok ? 1 : DIM;

    const g = panel.add(scene.add.graphics().setScrollFactor(0).setDepth(PANEL_CONTENT_DEPTH));
    g.fillStyle(PALETTE.slotFill).fillRoundedRect(x, y, WIDTH, ROW_H, 6);
    g.lineStyle(1, PALETTE.slotLine).strokeRoundedRect(x, y, WIDTH, ROW_H, 6);
    const icon = panel.add(scene.add.graphics().setScrollFactor(0).setDepth(PANEL_CONTENT_DEPTH).setAlpha(alpha));
    drawItemIcon(icon, x + ROW_H / 2, y + ROW_H / 2, recipe.id);

    panel.add(
      panelText(scene, x + ROW_H + 4, y + 13, itemName(recipe.id), { fontStyle: 'bold' })
        .setOrigin(0, 0.5)
        .setAlpha(alpha),
    );
    const needs = Object.entries(recipe.inputs)
      .map(([id, count]) => {
        const have = inventory.count(id);
        return `${itemName(id)} ${count}개` + (have < count ? ` (지금 ${have}개)` : '');
      })
      .join(', ');
    panel.add(
      panelText(scene, x + ROW_H + 4, y + 30, needs, { fontSize: '11px', color: PALETTE.mutedText })
        .setOrigin(0, 0.5)
        .setAlpha(ok ? 1 : 0.8),
    );

    if (!ok) return;
    const hit = panel.add(
      scene.add
        .zone(x, y, WIDTH, ROW_H)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(PANEL_CONTENT_DEPTH + 1)
        .setInteractive({ useHandCursor: true }),
    );
    let pressed = false;
    hit.on('pointerdown', () => (pressed = true));
    hit.on('pointerout', () => (pressed = false));
    hit.on('pointerup', () => {
      if (!pressed) return;
      panel.close();
      onPick(recipe);
    });
  });

  return panel.close;
}
