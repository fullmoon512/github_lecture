import { PALETTE } from '../palette.js';
import { UI_DEPTH } from './button.js';

// 수확한 칸 위로 "+1" 이 잠깐 떠올랐다 사라진다
export function showHarvestPop(scene, x, y, amount) {
  const text = scene.add
    .text(x, y, `+${amount}`, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: PALETTE.popText,
      stroke: PALETTE.popStroke,
      strokeThickness: 3,
    })
    .setOrigin(0.5)
    .setDepth(UI_DEPTH - 1);
  scene.tweens.add({
    targets: text,
    y: y - 14,
    alpha: 0,
    duration: 900,
    ease: 'Sine.easeOut',
    onComplete: () => text.destroy(),
  });
}
