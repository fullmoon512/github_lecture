import Phaser from 'phaser';
import { PALETTE } from '../palette.js';
import { UI_DEPTH } from '../ui/button.js';
import { tintAt } from '../state/dayTint.js';

const DEPTH = UI_DEPTH / 2; // 월드 물체(깊이 = y) 위, 수확 "+1"(UI_DEPTH - 1) 아래
const DROPS = 70;
const DROP_SPEED = 260; // px/s (화면 연출용)
const DROP_SLANT = 0.3;
const DROP_LEN = 5;

// 월드에만 덧씌우는 시간대 색 + 날씨 색, 비 오는 날 빗줄기. UI(상단바·창)는 물들지 않는다
export default class Sky {
  constructor(scene, { time, weather }) {
    this.scene = scene;
    this.time = time;
    this.weatherCfg = weather;
    const cam = scene.cameras.main;
    this.w = cam.width;
    this.h = cam.height;

    // 카메라에 고정. 확대 배율이 달라도 화면을 덮도록 넉넉하게
    const overlay = () =>
      scene.add
        .rectangle(-this.w, -this.h, this.w * 3, this.h * 3, 0xffffff, 1)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(DEPTH)
        .setAlpha(0);
    // 시간대 색은 곱하기: 아래 색을 그 색 쪽으로 어둡게 물들여 밤이 회색으로 뜨지 않게
    this.timeLayer = overlay().setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.weatherLayer = overlay();
    this.rain = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH + 1);
    this.drops = Array.from({ length: DROPS }, () => ({ x: Math.random() * this.w, y: Math.random() * this.h }));
    this.setWeather('sunny');
  }

  setWeather(weather) {
    this.weather = weather;
    const tint = { cloudy: [PALETTE.cloudyTint, this.weatherCfg.cloudyTint], rain: [PALETTE.rainTint, this.weatherCfg.rainTint] }[weather];
    this.weatherLayer.setFillStyle(tint ? tint[0] : 0xffffff, 1).setAlpha(tint ? tint[1] : 0);
    this.rain.clear();
  }

  // elapsedSec: 하루 시계. deltaMs: 빗줄기 움직임용
  update(elapsedSec, deltaMs) {
    const { color, alpha } = tintAt(elapsedSec, this.time, PALETTE.tint);
    this.timeLayer.setFillStyle(color, 1).setAlpha(alpha);

    if (this.weather !== 'rain') return;
    const dy = (DROP_SPEED * deltaMs) / 1000;
    const g = this.rain;
    g.clear();
    g.lineStyle(1, PALETTE.raindrop, 0.6);
    for (const d of this.drops) {
      d.y += dy;
      d.x -= dy * DROP_SLANT;
      if (d.y > this.h) {
        d.y -= this.h + DROP_LEN;
        d.x = Math.random() * (this.w + this.h * DROP_SLANT);
      }
      g.lineBetween(d.x, d.y, d.x + DROP_LEN * DROP_SLANT, d.y - DROP_LEN);
    }
  }
}
