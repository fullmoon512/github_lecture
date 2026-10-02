import { PALETTE } from '../palette.js';
import { UI_DEPTH } from './button.js';
import { drawItemIcon } from './itemIcon.js';

// 수확·요리한 자리 위로 아이콘 + "+1" 이 잠깐 떠올랐다 사라진다
export function showHarvestPop(scene, x, y, amount, itemId) {
  const icon = scene.add.graphics();
  drawItemIcon(icon, -8, 0, itemId);
  const text = scene.add
    .text(6, 0, `+${amount}`, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: PALETTE.popText,
      stroke: PALETTE.popStroke,
      strokeThickness: 3,
    })
    .setOrigin(0, 0.5);
  const pop = scene.add.container(x, y, [icon, text]).setDepth(UI_DEPTH - 1);
  scene.tweens.add({
    targets: pop,
    y: y - 14,
    alpha: 0,
    duration: 1100,
    ease: 'Sine.easeOut',
    onComplete: () => pop.destroy(),
  });
}
