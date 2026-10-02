import Phaser from 'phaser';
import { findPath, nearestWalkable } from '../systems/pathfinder.js';
import { PALETTE } from '../palette.js';

export const CAT_ARRIVED = 'arrived';

// 주인공 고양이 (임시 도형). 모션: 대기 / 걷기(좌우는 반전 재사용) / 작업(공통 1개)
export default class Cat extends Phaser.GameObjects.Container {
  constructor(scene, grid, tile, { speedPx, workMs }) {
    const p = grid.tileCenter(tile.x, tile.y);
    super(scene, p.x, p.y);
    this.grid = grid;
    this.speedPx = speedPx;
    this.workMs = workMs;
    this.waypoints = [];
    this.goal = null;
    this.onArrive = null;
    this.workTimer = null;
    this.workTween = null;

    const shadow = scene.add.ellipse(0, 6, 12, 4, PALETTE.shadow, 0.18);
    this.look = scene.add.container(0, 0);
    this.look.add(drawCat(scene));
    this.add([shadow, this.look]);

    this.bob = scene.tweens.add({
      targets: this.look,
      y: -1,
      duration: 120,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    this.setDepth(this.y);
    scene.add.existing(this);
  }

  get isWalking() {
    return this.waypoints.length > 0;
  }

  // 목표 타일까지 길을 찾아 걷기 시작. 막힌 칸이면 가장 가까운 열린 칸으로.
  // 실제로 향하는 타일을 돌려주고, 갈 수 없으면 null (이때는 하던 일을 계속한다)
  walkTo(tile, onArrive) {
    const goal = nearestWalkable(this.grid, tile);
    return goal ? this.walkToNearest([goal], onArrive) : null;
  }

  // 후보 타일 중 가장 가깝게 걸어갈 수 있는 곳으로. 도착하면 onArrive(goal)
  walkToNearest(tiles, onArrive) {
    const from = this.grid.worldToTile(this.x, this.y);
    let best = null;
    let bestCost = Infinity;
    for (const t of tiles) {
      if (!this.grid.isWalkable(t.x, t.y)) continue;
      const path = findPath(this.grid, from, t);
      const cost = path ? pathCost(path) : Infinity;
      if (cost < bestCost) {
        bestCost = cost;
        best = path;
      }
    }
    if (!best) return null;

    this.stop();
    // 첫 칸은 현재 칸의 중심: 걷던 도중이면 칸 중심으로 맞춘 뒤 이어서 간다
    this.waypoints = best.map((t) => this.grid.tileCenter(t.x, t.y));
    this.goal = best[best.length - 1];
    this.onArrive = onArrive ?? null;
    this.bob.resume();
    return this.goal;
  }

  // 걷기·작업을 멈추고 대기 자세로
  stop() {
    this.waypoints = [];
    this.goal = null;
    this.onArrive = null;
    this.workTimer?.remove();
    this.workTween?.stop();
    this.workTimer = null;
    this.workTween = null;
    this.bob.pause();
    this.look.setY(0).setScale(this.look.scaleX, 1);
  }

  // faceX 쪽을 보고 작업 모션(콕콕) 후 onDone
  work(faceX, onDone) {
    this.stop();
    if (faceX !== this.x) this.look.scaleX = faceX < this.x ? -1 : 1;
    this.workTween = this.scene.tweens.add({
      targets: this.look,
      y: 1,
      scaleY: 0.85,
      duration: 100,
      yoyo: true,
      repeat: -1,
    });
    this.workTimer = this.scene.time.delayedCall(this.workMs, () => {
      this.stop();
      onDone();
    });
  }

  update(delta) {
    if (!this.isWalking) return;

    let budget = (this.speedPx * delta) / 1000;
    while (budget > 0 && this.waypoints.length > 0) {
      const next = this.waypoints[0];
      const dx = next.x - this.x;
      const dy = next.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dx !== 0) this.look.scaleX = dx < 0 ? -1 : 1;

      if (dist <= budget) {
        this.setPosition(next.x, next.y);
        this.waypoints.shift();
        budget -= dist;
      } else {
        this.setPosition(this.x + (dx / dist) * budget, this.y + (dy / dist) * budget);
        budget = 0;
      }
    }
    this.setDepth(this.y);

    if (!this.isWalking) {
      this.bob.pause();
      this.look.y = 0;
      const goal = this.goal;
      const onArrive = this.onArrive;
      this.goal = null;
      this.onArrive = null;
      this.emit(CAT_ARRIVED, goal);
      onArrive?.(goal);
    }
  }
}

function pathCost(path) {
  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const diagonal = path[i].x !== path[i - 1].x && path[i].y !== path[i - 1].y;
    cost += diagonal ? Math.SQRT2 : 1;
  }
  return cost;
}

// 오른쪽을 보는 고양이 한 마리 (16×16 칸 안)
function drawCat(scene) {
  const g = scene.add.graphics();
  g.fillStyle(PALETTE.catBody);
  g.fillRect(-6, -1, 10, 6); // 몸
  g.fillRect(-5, 5, 2, 2); // 뒷다리
  g.fillRect(1, 5, 2, 2); // 앞다리
  g.fillRect(-8, -4, 2, 5); // 꼬리
  g.fillRect(0, -7, 7, 6); // 머리
  g.fillTriangle(0, -7, 2, -7, 0, -10); // 귀
  g.fillTriangle(5, -7, 7, -7, 7, -10);
  g.fillStyle(PALETTE.catLine);
  g.fillRect(4, -5, 1, 1); // 눈
  g.fillRect(6, -3, 1, 1); // 코
  return g;
}
