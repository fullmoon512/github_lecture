import Phaser from 'phaser';
import config from '../config.json';
import WorldScene from './scenes/WorldScene.js';
import { PALETTE } from './palette.js';

const { width, height } = config.game;

const parent = document.getElementById('game');

// 게임 영역(#game)에 들어가는 가장 큰 정수배. 640×360 보다 작을 때만 1배 미만으로 축소
function fitZoom() {
  const fit = Math.min(parent.clientWidth / width, parent.clientHeight / height);
  return fit >= 1 ? Math.floor(fit) : fit;
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  width,
  height,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: PALETTE.page,
  scale: {
    mode: Phaser.Scale.NONE,
    zoom: fitZoom(),
  },
  scene: [WorldScene],
});

window.addEventListener('resize', () => game.scale.setZoom(fitZoom()));

if (import.meta.env.DEV) {
  window.__game = game;
}
