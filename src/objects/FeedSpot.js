import { PALETTE } from '../palette.js';
import { sideTiles } from '../systems/walkGrid.js';
import { drawItemIcon } from '../ui/itemIcon.js';

// 먹이자리 한 칸 (임시 도형): 1타일 나무 쟁반 + 올려 둔 음식. 걸을 수 없는 칸
export default class FeedSpot {
  constructor(scene, grid, [tx, ty], minTouch) {
    this.tx = tx;
    this.ty = ty;
    grid.setBlocked(tx, ty);
    const t = grid.tileSize;
    this.center = { x: (tx + 0.5) * t, y: (ty + 0.5) * t };
    this.hitHalf = Math.max(minTouch, t) / 2;
    this.g = scene.add.graphics().setDepth((ty + 1) * t);
    this.render(null, 0);
  }

  contains(wx, wy) {
    return Math.abs(wx - this.center.x) <= this.hitHalf && Math.abs(wy - this.center.y) <= this.hitHalf;
  }

  standTiles() {
    return sideTiles(this.tx, this.ty, 1, 1);
  }

  render(foodId, queuedCount) {
    const { g } = this;
    const { x, y } = this.center;
    g.clear();
    g.fillStyle(PALETTE.trayRim).fillEllipse(x, y + 3, 16, 8);
    g.fillStyle(PALETTE.tray).fillEllipse(x, y + 2, 13, 5);
    if (foodId) drawItemIcon(g, x, y - 2, foodId);
    if (queuedCount > 0) {
      g.fillStyle(PALETTE.queued).fillCircle(x + 7, y - 7, 3);
      g.lineStyle(1, PALETTE.buttonLine).strokeCircle(x + 7, y - 7, 3);
    }
  }
}
