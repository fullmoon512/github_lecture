import { PALETTE } from '../palette.js';
import { MIN_TOUCH } from '../ui/button.js';
import { drawCrop } from './cropLook.js';
import { sideTiles } from '../systems/walkGrid.js';

const PLOT_DEPTH = 1; // 땅 바로 위. 고양이(깊이 = y)는 항상 그 위

// 텃밭 칸들의 위치·모양. 밭 칸은 걸을 수 없는 칸으로 막고, 고양이는 옆 칸에 서서 작업한다
export default class FarmField {
  constructor(scene, grid, farm, { originTileX, originTileY, plotTiles, gapTiles, cols }) {
    this.grid = grid;
    this.farm = farm;
    this.size = plotTiles;
    const t = grid.tileSize;
    const pitch = plotTiles + gapTiles;

    this.plots = farm.plots.map((_, i) => {
      const tx = originTileX + (i % cols) * pitch;
      const ty = originTileY + Math.floor(i / cols) * pitch;
      for (let y = ty; y < ty + plotTiles; y++) {
        for (let x = tx; x < tx + plotTiles; x++) grid.setBlocked(x, y);
      }
      return {
        tx,
        ty,
        px: tx * t,
        py: ty * t,
        w: plotTiles * t,
        cx: (tx + plotTiles / 2) * t,
        cy: (ty + plotTiles / 2) * t,
        g: scene.add.graphics().setDepth(PLOT_DEPTH),
      };
    });
    this.hitHalf = Math.max(MIN_TOUCH, plotTiles * t) / 2;
    this.plots.forEach((_, i) => this.render(i, 0));
  }

  // 월드 좌표가 가리키는 밭 칸 번호 (없으면 -1). 터치 영역은 최소 44px
  plotAt(wx, wy) {
    let best = -1;
    let bestD = Infinity;
    this.plots.forEach((p, i) => {
      const dx = Math.abs(wx - p.cx);
      const dy = Math.abs(wy - p.cy);
      if (dx > this.hitHalf || dy > this.hitHalf) return;
      if (dx + dy < bestD) {
        bestD = dx + dy;
        best = i;
      }
    });
    return best;
  }

  center(i) {
    const p = this.plots[i];
    return { x: p.cx, y: p.cy };
  }

  // 작업할 때 설 수 있는 칸: 밭의 네 변에 붙은 타일
  standTiles(i) {
    const { tx, ty } = this.plots[i];
    return sideTiles(tx, ty, this.size, this.size);
  }

  render(i, queuedCount) {
    const p = this.plots[i];
    const plot = this.farm.plots[i];
    const { g, px, py, w } = p;
    g.clear();

    // 흙: 물 준 날은 진한 색, 이랑 줄 세 개
    g.fillStyle(plot.watered ? PALETTE.soilWet : PALETTE.soilDry).fillRect(px, py, w, w);
    g.fillStyle(plot.watered ? PALETTE.soilWetLine : PALETTE.soilDryLine);
    for (let k = 1; k <= 3; k++) g.fillRect(px + 2, py + (w * k) / 4, w - 4, 1);

    if (plot.crop !== null) {
      drawCrop(g, p.cx, p.cy + 6, plot.crop, this.farm.progress(i));
    }

    // 예약 표시: 오른쪽 위 작은 동그라미
    if (queuedCount > 0) {
      g.fillStyle(PALETTE.queued).fillCircle(px + w - 4, py + 4, 3);
      g.lineStyle(1, PALETTE.buttonLine).strokeCircle(px + w - 4, py + 4, 3);
    }
  }
}
