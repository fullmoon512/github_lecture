import Phaser from 'phaser';
import config from '../../config.json';
import { PALETTE } from '../palette.js';
import WalkGrid from '../systems/walkGrid.js';
import { enableCameraDrag, WORLD_TAP } from '../systems/cameraDrag.js';
import Cat from '../objects/Cat.js';
import { createHomeButton } from '../ui/homeButton.js';
import { showTapMarker } from '../ui/tapMarker.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create() {
    const { tileSize } = config.game;
    const { widthTiles, heightTiles, homeX, homeY } = config.world;
    const worldW = widthTiles * tileSize;
    const worldH = heightTiles * tileSize;

    this.drawGround(widthTiles, heightTiles, tileSize);

    // 맵 외곽 한 줄은 울타리 자리: 걸을 수 없음
    this.grid = new WalkGrid(widthTiles, heightTiles, tileSize);
    for (let x = 0; x < widthTiles; x++) {
      this.grid.setBlocked(x, 0);
      this.grid.setBlocked(x, heightTiles - 1);
    }
    for (let y = 0; y < heightTiles; y++) {
      this.grid.setBlocked(0, y);
      this.grid.setBlocked(widthTiles - 1, y);
    }

    const { startTileX, startTileY, speedTilesPerSec } = config.character;
    this.cat = new Cat(
      this,
      this.grid,
      { x: startTileX, y: startTileY },
      speedTilesPerSec * tileSize,
    );

    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, worldH);
    cam.centerOn(homeX, homeY);

    enableCameraDrag(this, { thresholdPx: config.camera.dragThresholdPx });
    createHomeButton(this, { homeX, homeY, panMs: config.camera.homePanMs });

    // 땅 탭 → 걸어감. 걷는 중에 다시 탭하면 새 목적지로 바꾼다
    this.events.on(WORLD_TAP, ({ x, y }) => {
      const goal = this.cat.walkTo(this.grid.worldToTile(x, y));
      if (goal) showTapMarker(this, this.grid, goal);
    });
  }

  update(_time, delta) {
    this.cat.update(delta);
  }

  // 빈 땅(임시 도형): 체크무늬 잔디 + 맵 외곽 한 줄. 한 장의 텍스처로 구워 둔다.
  drawGround(cols, rows, tile) {
    const g = this.make.graphics({ add: false });
    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const edge = tx === 0 || ty === 0 || tx === cols - 1 || ty === rows - 1;
        const color = edge
          ? PALETTE.worldEdge
          : (tx + ty) % 2 === 0
            ? PALETTE.grassA
            : PALETTE.grassB;
        g.fillStyle(color).fillRect(tx * tile, ty * tile, tile, tile);
      }
    }
    g.generateTexture('ground', cols * tile, rows * tile);
    g.destroy();
    this.add.image(0, 0, 'ground').setOrigin(0);
  }
}
