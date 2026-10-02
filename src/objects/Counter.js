import { PALETTE } from '../palette.js';
import { sideTiles } from '../systems/walkGrid.js';

// 조리대 (임시 도형): 나무 탁자 위 냄비 + 도마. 걸을 수 없는 칸이고, 고양이는 옆에 서서 요리한다
export default class Counter {
  constructor(scene, grid, { counterTileX, counterTileY, widthTiles }, minTouch) {
    this.scene = scene;
    this.tx = counterTileX;
    this.ty = counterTileY;
    this.w = widthTiles;
    for (let x = this.tx; x < this.tx + this.w; x++) grid.setBlocked(x, this.ty);

    const t = grid.tileSize;
    this.px = this.tx * t;
    this.py = this.ty * t;
    this.pw = this.w * t;
    this.ph = t;
    this.center = { x: this.px + this.pw / 2, y: this.py + this.ph / 2 };
    this.potX = this.px + 9;
    this.hitHalfW = Math.max(minTouch, this.pw) / 2;
    this.hitHalfH = Math.max(minTouch, this.ph) / 2;

    // 깊이 = 아래쪽 끝: 아래에 선 고양이는 앞에, 위에 선 고양이는 뒤에 보인다
    this.g = scene.add.graphics().setDepth(this.py + this.ph);
    this.steamTimer = null;
    this.render(0);
  }

  contains(wx, wy) {
    return Math.abs(wx - this.center.x) <= this.hitHalfW && Math.abs(wy - this.center.y) <= this.hitHalfH;
  }

  standTiles() {
    return sideTiles(this.tx, this.ty, this.w, 1);
  }

  render(queuedCount) {
    const { g, px, py, pw, ph } = this;
    g.clear();
    g.fillStyle(PALETTE.wood).fillRect(px, py + 2, pw, ph - 2);
    g.fillStyle(PALETTE.woodDark).fillRect(px, py + ph - 5, pw, 5);
    g.fillRect(px + 2, py + ph, 2, 2);
    g.fillRect(px + pw - 4, py + ph, 2, 2);
    // 냄비
    g.fillStyle(PALETTE.pot).fillRoundedRect(this.potX - 6, py - 3, 12, 9, 2);
    g.fillStyle(PALETTE.potLid).fillRect(this.potX - 7, py - 4, 14, 2);
    g.fillRect(this.potX - 1, py - 6, 2, 2);
    // 도마 + 당근 한 조각
    g.fillStyle(PALETTE.cupWhite).fillRect(px + pw - 13, py + 3, 10, 5);
    g.fillStyle(PALETTE.crop.carrot).fillRect(px + pw - 10, py + 4, 3, 2);

    if (queuedCount > 0) {
      g.fillStyle(PALETTE.queued).fillCircle(px + pw - 2, py - 2, 3);
      g.lineStyle(1, PALETTE.buttonLine).strokeCircle(px + pw - 2, py - 2, 3);
    }
  }

  // 요리하는 동안 냄비에서 김이 모락모락
  startSteam() {
    this.stopSteam();
    this.steamTimer = this.scene.time.addEvent({
      delay: 280,
      loop: true,
      callback: () => {
        const puff = this.scene.add
          .circle(this.potX + Math.round(Math.random() * 6 - 3), this.py - 7, 2, PALETTE.steam, 0.8)
          .setDepth(this.g.depth + 1);
        this.scene.tweens.add({
          targets: puff,
          y: puff.y - 10,
          alpha: 0,
          scale: 1.8,
          duration: 900,
          ease: 'Sine.easeOut',
          onComplete: () => puff.destroy(),
        });
      },
    });
  }

  stopSteam() {
    this.steamTimer?.remove();
    this.steamTimer = null;
  }
}
