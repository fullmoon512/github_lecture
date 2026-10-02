import Phaser from 'phaser';
import config from '../../config.json';
import { PALETTE } from '../palette.js';
import WalkGrid from '../systems/walkGrid.js';
import WorkQueue from '../systems/workQueue.js';
import { enableCameraDrag, WORLD_TAP } from '../systems/cameraDrag.js';
import Farm from '../state/farm.js';
import Inventory from '../state/inventory.js';
import DayClock from '../state/dayClock.js';
import { rollWeather } from '../state/weather.js';
import { unlockedCrops } from '../state/crops.js';
import { visibleRecipes } from '../state/kitchen.js';
import { itemOrder } from '../data/items.js';
import Cat from '../objects/Cat.js';
import FarmField from '../objects/FarmField.js';
import Counter from '../objects/Counter.js';
import { MIN_TOUCH } from '../ui/button.js';
import { showDialog } from '../ui/dialog.js';
import { showStoragePopup } from '../ui/storagePopup.js';
import { showRecipePopup } from '../ui/recipePopup.js';
import { showTapMarker } from '../ui/tapMarker.js';
import { showHarvestPop } from '../ui/harvestPop.js';

// 월드(땅·밭·조리대·고양이)와 게임 진행. 카메라는 config.world.zoom 배로 확대된다.
// 버튼·창은 UIScene(this.ui)에 그린다
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create() {
    const { tileSize } = config.game;
    const { widthTiles, heightTiles, homeX, homeY, zoom } = config.world;
    const minTouch = MIN_TOUCH / zoom; // 화면 44px 를 월드 px 로
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

    this.clock = new DayClock(config.time);
    this.weather = config.weather.firstDay;
    this.sleeping = false; // 하루가 끝나 정산 중이거나 잠자기 확인 중이면 시계가 멈춘다
    this.popupOpen = false; // 창고·조리대 창을 보는 동안에도 시계가 멈춘다 (고양이는 하던 일 계속)
    this.farm = new Farm(config, config.game.startPlots);
    this.inventory = new Inventory();
    this.itemOrder = itemOrder(config);
    this.field = new FarmField(this, this.grid, this.farm, config.farm, minTouch);
    this.counter = new Counter(this, this.grid, config.kitchen, minTouch);

    const { startTileX, startTileY, speedTilesPerSec, workSec } = config.character;
    this.cat = new Cat(this, this.grid, { x: startTileX, y: startTileY }, {
      speedPx: speedTilesPerSec * tileSize,
      workMs: workSec * 1000,
    });
    this.work = new WorkQueue(this.cat);

    // 월드 카메라 확대. 맵이 화면보다 작으면 남는 줄은 위쪽(상단바 자리)으로, 울타리 색으로 채운다
    const cam = this.cameras.main;
    cam.setZoom(zoom);
    const viewW = cam.width / zoom;
    const viewH = cam.height / zoom;
    const boundW = Math.max(worldW, viewW);
    const boundH = Math.max(worldH, viewH);
    cam.setBounds(worldW - boundW, worldH - boundH, boundW, boundH);
    cam.setBackgroundColor(PALETTE.worldEdge);
    cam.centerOn(homeX, homeY);
    this.worldBiggerThanView = worldW > viewW || worldH > viewH;

    enableCameraDrag(this, { thresholdPx: config.camera.dragThresholdPx });

    this.events.on(WORLD_TAP, ({ x, y }) => {
      if (this.sleeping) return;
      if (this.counter.contains(x, y)) {
        this.openRecipes();
        return;
      }
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
    const seed = this.ui.seedBar.selected;
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
          showHarvestPop(this, c.x, c.y - 10, harvested.amount, harvested.crop);
        }
      },
      onEnd: () => this.field.render(i, this.work.countFor(i)),
    });
    this.field.render(i, this.work.countFor(i));
  }

  renderPlots() {
    this.farm.plots.forEach((_, i) => this.field.render(i, this.work.countFor(i)));
  }

  openStorage() {
    if (this.sleeping || this.popupOpen) return;
    this.popupOpen = true;
    showStoragePopup(this.ui, {
      entries: this.inventory.list(this.itemOrder),
      onClose: () => (this.popupOpen = false),
    });
  }

  // 조리대 탭 → 요리 고르기. 고르는 순간 재료를 꺼내 두고, 요리가 취소되면 되돌린다
  openRecipes() {
    if (this.popupOpen) return;
    this.popupOpen = true;
    showRecipePopup(this.ui, {
      recipes: visibleRecipes(config.cooking.recipes, unlockedCrops(config.crops)),
      inventory: this.inventory,
      onClose: () => (this.popupOpen = false),
      onPick: (recipe) => {
        if (this.inventory.take(recipe.inputs)) this.queueCook(recipe);
      },
    });
  }

  queueCook(recipe) {
    const key = 'counter';
    this.work.push({
      key,
      standTiles: this.counter.standTiles(),
      faceX: this.counter.center.x,
      workMs: config.cooking.craftTimeSec * 1000,
      canRun: () => true,
      onWorkStart: () => this.counter.startSteam(),
      run: () => {
        this.inventory.add(recipe.id, 1);
        showHarvestPop(this, this.counter.center.x, this.counter.py - 10, 1, recipe.id);
      },
      onCancel: () => this.inventory.give(recipe.inputs),
      onEnd: () => {
        this.counter.stopSteam();
        this.counter.render(this.work.countFor(key));
      },
    });
    this.counter.render(this.work.countFor(key));
  }

  // 🌙 잠자기: 한 번 묻고 나서 하루를 끝낸다. 묻는 동안 시계는 멈춘다
  askSleep() {
    if (this.sleeping) return;
    this.sleeping = true;
    showDialog(this.ui, {
      title: '오늘은 이만 잘까요?',
      buttons: [
        { label: '조금 더', onTap: () => (this.sleeping = false) },
        { label: '잘래요', onTap: () => this.endDay() },
      ],
    });
  }

  // 하루 끝: 할 일 멈춤 → 작물 성장 → 어두워짐 → 정산 → [잘 자요] → 다음 날 아침
  endDay() {
    this.sleeping = true;
    this.cat.stop();
    this.work.clear();
    this.farm.advanceDay();

    const day = this.clock.day;
    this.tweens.add({
      targets: this.ui.nightShade,
      alpha: 0.75,
      duration: 700,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.renderPlots();
        showDialog(this.ui, {
          title: `${day}일째가 저물었어요`,
          body: '오늘 하루도 수고했어요.',
          buttons: [{ label: '잘 자요', onTap: () => this.startMorning() }],
        });
      },
    });
  }

  startMorning() {
    this.clock.nextDay();
    this.weather = rollWeather(config.weather);
    if (this.weather === 'rain' && config.weather.rainAutoWater) this.farm.waterAll();
    this.renderPlots();
    this.ui.topBar.update(this.clock.day, this.weather);

    this.tweens.add({
      targets: this.ui.nightShade,
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeInOut',
      onComplete: () => (this.sleeping = false),
    });
  }

  update(_time, delta) {
    this.cat.update(delta);
    // 밤이 끝나면 자동으로 하루 끝 (묻지 않음)
    const paused = this.sleeping || this.popupOpen;
    if (!paused && this.clock.tick(delta / 1000)) this.endDay();
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
