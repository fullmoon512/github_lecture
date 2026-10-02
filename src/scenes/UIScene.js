import Phaser from 'phaser';
import config from '../../config.json';
import { PALETTE } from '../palette.js';
import { unlockedCrops } from '../state/crops.js';
import { UI_DEPTH } from '../ui/button.js';
import TopBar from '../ui/topBar.js';
import SeedBar from '../ui/seedBar.js';
import { createHomeButton } from '../ui/homeButton.js';

// 월드 위에 겹치는 UI 장면. 월드는 확대(config.world.zoom)되지만 UI 는 1배 그대로.
// 버튼·창이 탭을 받으면 아래 월드 장면에는 전달되지 않는다
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: true });
  }

  create() {
    const world = this.scene.get('World');
    const cam = this.cameras.main;

    this.seedBar = new SeedBar(this, unlockedCrops(config.crops));
    this.topBar = new TopBar(this, {
      onStorage: () => world.openStorage(),
      onSleep: () => world.askSleep(),
    });
    this.topBar.update(world.clock.day, world.weather);

    // 드래그·🏠 는 맵이 화면보다 클 때(맵 확장 후) 의미가 있다
    if (world.worldBiggerThanView) {
      const { homeX, homeY } = config.world;
      createHomeButton(this, world.cameras.main, { homeX, homeY, panMs: config.camera.homePanMs });
    }

    // 하루가 끝날 때 화면을 덮는 밤빛 (대화창 바로 아래)
    this.nightShade = this.add
      .rectangle(0, 0, cam.width, cam.height, PALETTE.night)
      .setOrigin(0)
      .setDepth(UI_DEPTH + 50)
      .setAlpha(0);

    world.ui = this;
  }
}
