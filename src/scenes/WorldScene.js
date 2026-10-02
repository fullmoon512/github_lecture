import Phaser from 'phaser';
import config from '../../config.json';
import { PALETTE } from '../palette.js';
import { enableCameraDrag } from '../systems/cameraDrag.js';
import { createHomeButton } from '../ui/homeButton.js';

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

    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, worldH);
    cam.centerOn(homeX, homeY);

    enableCameraDrag(this, { thresholdPx: config.camera.dragThresholdPx });
    createHomeButton(this, { homeX, homeY, panMs: config.camera.homePanMs });
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
