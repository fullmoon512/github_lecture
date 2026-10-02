import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import FeedSpots from '../src/state/feedSpots.js';
import Farm from '../src/state/farm.js';
import { foodCategory, itemOrder } from '../src/data/items.js';

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));

test('음식 분류: 작물=생채소, 요리=레시피 분류, 동물 선물은 음식 아님', () => {
  assert.equal(foodCategory('carrot', config), 'raw');
  assert.equal(foodCategory('carrot_juice', config), 'juice');
  assert.equal(foodCategory('herb_tea', config), 'tea');
  assert.equal(foodCategory('egg', config), null);
  for (const id of itemOrder(config)) {
    const cat = foodCategory(id, config);
    assert.ok(cat === null || config.foodCategories.includes(cat), id);
  }
});

test('config: 먹이자리 자리 수는 최대 칸 수 이상', () => {
  const max = Math.max(config.feedSpots.start, ...config.feedSpots.levels.map((l) => l.spots));
  assert.ok(config.feedSpots.tiles.length >= max);
});

test('올리기·바꾸기·내리기는 원래 음식을 돌려준다', () => {
  const f = new FeedSpots(config.feedSpots.start);
  assert.equal(f.get(0), null);
  assert.equal(f.place(0, 'carrot'), null);
  assert.equal(f.get(0), 'carrot');
  assert.equal(f.place(0, 'carrot_juice'), 'carrot', '바꾸면 원래 음식이 돌아온다');
  assert.equal(f.remove(0), 'carrot_juice');
  assert.equal(f.get(0), null);
  assert.equal(f.remove(0), null, '빈 칸을 내리면 아무것도 없음');
});

test('올려 둔 음식은 하루가 지나도 그대로', () => {
  const f = new FeedSpots(1);
  const farm = new Farm(config, 4);
  f.place(0, 'carrot_jam');
  farm.advanceDay();
  assert.equal(f.get(0), 'carrot_jam');
});
