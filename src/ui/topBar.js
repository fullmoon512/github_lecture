import { PALETTE } from '../palette.js';
import { createButton, MIN_TOUCH, UI_DEPTH } from './button.js';
import { drawWeather } from './weatherIcon.js';

const MARGIN = 6;
const GAP = 6;
const CHIP_H = 24;

// 상단바 한 줄: 왼쪽 날짜·날씨, 오른쪽 버튼들 🎒 (📖 🔨) 🌙.
// 온기·📖·🔨 는 각 단계에서 이 줄에 추가한다
export default class TopBar {
  constructor(scene, { onStorage, onSleep }) {
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH);
    this.dayText = scene.add
      .text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '12px', color: PALETTE.popStroke })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);

    const cam = scene.cameras.main;
    createButton(scene, cam.width - MARGIN - MIN_TOUCH, MARGIN, {
      // 초승달: 노란 원에 버튼 색 원을 겹쳐 깎는다
      draw: (g, cx, cy) => {
        g.fillStyle(PALETTE.sun).fillCircle(cx, cy, 9);
        g.fillStyle(PALETTE.buttonFill).fillCircle(cx + 5, cy - 4, 8);
      },
      onTap: onSleep,
    });

    createButton(scene, cam.width - MARGIN - MIN_TOUCH * 2 - GAP, MARGIN, {
      // 가방: 몸통 + 덮개 + 손잡이 + 잠금쇠
      draw: (g, cx, cy) => {
        g.lineStyle(2, PALETTE.bagDark).strokeRoundedRect(cx - 5, cy - 11, 10, 8, 3);
        g.fillStyle(PALETTE.bag).fillRoundedRect(cx - 9, cy - 5, 18, 15, 4);
        g.fillStyle(PALETTE.bagDark).fillRoundedRect(cx - 9, cy - 5, 18, 7, 3);
        g.fillStyle(PALETTE.buttonFill).fillRect(cx - 2, cy, 4, 3);
      },
      onTap: onStorage,
    });
  }

  update(day, weather) {
    const y = MARGIN + MIN_TOUCH / 2;
    this.dayText.setText(`${day}일째`).setPosition(MARGIN + 10, y);
    const iconX = this.dayText.x + this.dayText.width + 14;
    const chipW = iconX + 12 - MARGIN;

    this.g.clear();
    this.g.fillStyle(PALETTE.buttonFill).fillRoundedRect(MARGIN, y - CHIP_H / 2, chipW, CHIP_H, CHIP_H / 2);
    this.g.lineStyle(2, PALETTE.buttonLine).strokeRoundedRect(MARGIN, y - CHIP_H / 2, chipW, CHIP_H, CHIP_H / 2);
    drawWeather(this.g, iconX, y, weather);
  }
}
