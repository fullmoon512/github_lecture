import { PALETTE } from '../palette.js';

// 목적지 칸에 잠깐 나타났다 사라지는 테두리
export function showTapMarker(scene, grid, tile) {
  const size = grid.tileSize;
  const marker = scene.add
    .rectangle(tile.x * size, tile.y * size, size, size)
    .setOrigin(0)
    .setStrokeStyle(1, PALETTE.tapMarker)
    .setDepth(1);
  scene.tweens.add({
    targets: marker,
    alpha: 0,
    duration: 500,
    ease: 'Sine.easeIn',
    onComplete: () => marker.destroy(),
  });
}
