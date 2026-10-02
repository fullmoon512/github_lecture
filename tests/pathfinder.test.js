import { test } from 'node:test';
import assert from 'node:assert/strict';
import WalkGrid from '../src/systems/walkGrid.js';
import { findPath, nearestWalkable } from '../src/systems/pathfinder.js';

test('막힌 곳이 없으면 직선/대각선 최단', () => {
  const g = new WalkGrid(10, 10, 16);
  assert.equal(findPath(g, { x: 0, y: 0 }, { x: 5, y: 0 }).length, 6);
  assert.equal(findPath(g, { x: 0, y: 0 }, { x: 4, y: 4 }).length, 5);
});

test('벽을 돌아가고, 모서리를 비스듬히 끼어가지 않는다', () => {
  const g = new WalkGrid(10, 10, 16);
  for (let y = 0; y <= 8; y++) g.setBlocked(5, y);
  const p = findPath(g, { x: 2, y: 2 }, { x: 8, y: 2 });
  assert.ok(p.some((t) => t.y === 9));
  for (let i = 1; i < p.length; i++) {
    const dx = p[i].x - p[i - 1].x;
    const dy = p[i].y - p[i - 1].y;
    assert.ok(g.isWalkable(p[i].x, p[i].y));
    if (dx && dy) {
      assert.ok(g.isWalkable(p[i - 1].x + dx, p[i - 1].y) && g.isWalkable(p[i - 1].x, p[i - 1].y + dy));
    }
  }
});

test('갈 수 없으면 null, 막힌 칸이면 가장 가까운 열린 칸', () => {
  const g = new WalkGrid(10, 10, 16);
  for (let y = 0; y < 10; y++) g.setBlocked(5, y);
  assert.equal(findPath(g, { x: 2, y: 2 }, { x: 8, y: 2 }), null);
  assert.equal(findPath(g, { x: 2, y: 2 }, { x: 5, y: 3 }), null);
  assert.deepEqual(nearestWalkable(g, { x: 5, y: 3 }), { x: 4, y: 3 });
  assert.deepEqual(nearestWalkable(g, { x: -3, y: 3 }), { x: 0, y: 3 });
});
