import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { visibleRecipes } from '../src/state/kitchen.js';
import { unlockedCrops } from '../src/state/crops.js';
import WorkQueue from '../src/systems/workQueue.js';

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));

test('해금된 작물로 만드는 요리만 보인다', () => {
  const ids = visibleRecipes(config.cooking.recipes, unlockedCrops(config.crops)).map((r) => r.id);
  assert.deepEqual(ids, ['carrot_juice', 'carrot_jam']);
  const all = visibleRecipes(config.cooking.recipes, Object.keys(config.crops)).map((r) => r.id);
  assert.deepEqual(all, Object.keys(config.cooking.recipes));
});

test('레시피 분류는 모두 foodCategories 안에 있고, 재료는 작물', () => {
  for (const [id, r] of Object.entries(config.cooking.recipes)) {
    assert.ok(config.foodCategories.includes(r.category), id);
    for (const input of Object.keys(r.inputs)) assert.ok(config.crops[input], `${id}: ${input}`);
  }
});

// 고양이 대역: 걷기·작업을 직접 진행시킬 수 있게
function fakeCat() {
  return {
    reachable: true,
    walkToNearest(_tiles, onArrive) {
      if (!this.reachable) return null;
      this.arrive = onArrive;
      return { x: 0, y: 0 };
    },
    work(_faceX, onDone) {
      this.done = onDone;
    },
  };
}

test('예약 취소·도착 불가면 onCancel, 실행되면 onCancel 없음', () => {
  const cat = fakeCat();
  const q = new WorkQueue(cat);
  const log = [];
  const task = (name) => ({
    key: name,
    standTiles: [],
    faceX: 0,
    canRun: () => true,
    run: () => log.push(`run ${name}`),
    onCancel: () => log.push(`cancel ${name}`),
    onEnd: () => log.push(`end ${name}`),
  });

  q.push(task('a'));
  q.push(task('b'));
  cat.arrive();
  cat.done();
  assert.deepEqual(log, ['run a', 'end a']);

  q.clear(); // b 는 걷는 중에 취소
  assert.deepEqual(log.slice(2), ['cancel b', 'end b']);

  cat.reachable = false;
  q.push(task('c'));
  assert.deepEqual(log.slice(4), ['cancel c', 'end c']);
  assert.equal(q.current, null);
});
