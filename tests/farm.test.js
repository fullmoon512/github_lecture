import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Farm, { ACTION } from '../src/state/farm.js';

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));
const growDays = config.crops.carrot.growDays;
const newFarm = () => new Farm(config, config.game.startPlots);

test('시작 밭 칸 수는 config.game.startPlots', () => {
  assert.equal(newFarm().plots.length, config.game.startPlots);
});

test('빈 밭 → 심기 → 물주기 → (오늘은) 할 일 없음', () => {
  const f = newFarm();
  assert.equal(f.nextAction(0, 'carrot'), ACTION.PLANT);
  f.perform(0, ACTION.PLANT, 'carrot');
  assert.equal(f.nextAction(0, 'carrot'), ACTION.WATER);
  f.perform(0, ACTION.WATER, 'carrot');
  assert.equal(f.nextAction(0, 'carrot'), null);
});

test('물 준 날만 자란다', () => {
  const f = newFarm();
  f.perform(0, ACTION.PLANT, 'carrot');
  f.advanceDay(); // 물 안 줌
  assert.equal(f.plots[0].growth, 0);
  f.perform(0, ACTION.WATER, 'carrot');
  f.advanceDay();
  assert.equal(f.plots[0].growth, 1);
  assert.equal(f.plots[0].watered, false, '다음 날엔 물 준 기록이 초기화');
});

test('물을 오래 안 줘도 시들지 않는다', () => {
  const f = newFarm();
  f.perform(0, ACTION.PLANT, 'carrot');
  for (let d = 0; d < 30; d++) f.advanceDay();
  assert.equal(f.plots[0].crop, 'carrot');
  assert.equal(f.nextAction(0, 'carrot'), ACTION.WATER);
});

test('다 자라야만 수확, 수확하면 빈 밭 + yield 개', () => {
  const f = newFarm();
  f.perform(0, ACTION.PLANT, 'carrot');
  for (let d = 0; d < growDays; d++) {
    assert.equal(f.perform(0, ACTION.HARVEST, 'carrot'), null, '덜 자랐으면 수확 안 됨');
    f.perform(0, ACTION.WATER, 'carrot');
    f.advanceDay();
  }
  assert.ok(f.isReady(0));
  assert.equal(f.nextAction(0, 'carrot'), ACTION.HARVEST);
  assert.deepEqual(f.perform(0, ACTION.HARVEST, 'carrot'), { crop: 'carrot', amount: config.harvest.yield });
  assert.deepEqual(f.plots[0], { crop: null, growth: 0, watered: false });
});

test('다 자란 뒤에는 더 자라지 않는다', () => {
  const f = newFarm();
  f.perform(0, ACTION.PLANT, 'carrot');
  for (let d = 0; d < growDays + 3; d++) {
    if (!f.isReady(0)) f.perform(0, ACTION.WATER, 'carrot');
    f.advanceDay();
  }
  assert.equal(f.plots[0].growth, growDays);
});

test('연달아 탭할 때 예약 가능한 행동 목록', () => {
  const f = newFarm();
  assert.deepEqual(f.plannedActions(0, 'carrot'), [ACTION.PLANT, ACTION.WATER]);
  f.perform(0, ACTION.PLANT, 'carrot');
  f.perform(0, ACTION.WATER, 'carrot');
  assert.deepEqual(f.plannedActions(0, 'carrot'), []);
  for (let d = 0; d < growDays; d++) {
    f.perform(0, ACTION.WATER, 'carrot');
    f.advanceDay();
  }
  assert.deepEqual(f.plannedActions(0, 'carrot'), [ACTION.HARVEST, ACTION.PLANT, ACTION.WATER]);
  assert.equal(f.plots[0].crop, 'carrot', '계획 계산은 실제 밭을 바꾸지 않는다');
});

test('다른 칸끼리는 독립', () => {
  const f = newFarm();
  f.perform(1, ACTION.PLANT, 'carrot');
  assert.equal(f.plots[0].crop, null);
  assert.equal(f.nextAction(0, 'carrot'), ACTION.PLANT);
});
