import Phaser from 'phaser';
import config from '../../config.json';
import { PALETTE } from '../palette.js';
import WalkGrid from '../systems/walkGrid.js';
import WorkQueue from '../systems/workQueue.js';
import { enableCameraDrag, WORLD_TAP } from '../systems/cameraDrag.js';
import Farm from '../state/farm.js';
import Inventory from '../state/inventory.js';
import { unlockedCrops } from '../state/crops.js';
import Cat from '../objects/Cat.js';
import FarmField from '../objects/FarmField.js';
import { createButton, MIN_TOUCH } from '../ui/button.js';
import { createHomeButton } from '../ui/homeButton.js';
import { showTapMarker } from '../ui/tapMarker.js';
import { showHarvestPop } from '../ui/harvestPop.js';
import SeedBar from '../ui/seedBar.js';

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

    this.farm = new Farm(config, config.game.startPlots);
    this.inventory = new Inventory();
    this.field = new FarmField(this, this.grid, this.farm, config.farm);

    const { startTileX, startTileY, speedTilesPerSec, workSec } = config.character;
    this.cat = new Cat(this, this.grid, { x: startTileX, y: startTileY }, {
      speedPx: speedTilesPerSec * tileSize,
      workMs: workSec * 1000,
    });
    this.work = new WorkQueue(this.cat);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, worldH);
    cam.centerOn(homeX, homeY);

    enableCameraDrag(this, { thresholdPx: config.camera.dragThresholdPx });
    createHomeButton(this, { homeX, homeY, panMs: config.camera.homePanMs });
    this.seedBar = new SeedBar(this, unlockedCrops(config.crops));
    if (import.meta.env.DEV) this.addDevDayButton();

    this.events.on(WORLD_TAP, ({ x, y }) => {
      const plot = this.field.plotAt(x, y);
      if (plot !== -1) {
        this.queuePlotWork(plot);
        return;
      }
      // 빈 땅 탭 = 지금 저기로: 하던 일을 멈추고 남은 예약은 취소
      const goal = this.cat.walkTo(this.grid.worldToTile(x, y));
      if (goal) {
        this.work.clear();
        showTapMarker(this, this.grid, goal);
      }
    });
  }

  // 밭 칸 탭 → 작업 예약. 이 칸에서 앞으로 할 수 있는 행동 수만큼만 쌓인다
  queuePlotWork(i) {
    const seed = this.seedBar.selected;
    if (this.work.countFor(i) >= this.farm.plannedActions(i, seed).length) return;

    this.work.push({
      key: i,
      standTiles: this.field.standTiles(i),
      faceX: this.field.center(i).x,
      canRun: () => this.farm.nextAction(i, seed) !== null,
      run: () => {
        const harvested = this.farm.perform(i, this.farm.nextAction(i, seed), seed);
        if (harvested) {
          this.inventory.add(harvested.crop, harvested.amount);
          const c = this.field.center(i);
          showHarvestPop(this, c.x, c.y - 10, harvested.amount);
        }
      },
      onEnd: () => this.field.render(i, this.work.countFor(i)),
    });
    this.field.render(i, this.work.countFor(i));
  }

  // 개발 실행(npm run dev)에서만: 하루 진행(4단계) 전까지 성장·수확 확인용
  addDevDayButton() {
    const x = this.cameras.main.width - 6 - MIN_TOUCH;
    createButton(this, x, 6, {
      label: '+1일',
      onTap: () => {
        this.farm.advanceDay();
        this.farm.plots.forEach((_, i) => this.field.render(i, this.work.countFor(i)));
      },
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
