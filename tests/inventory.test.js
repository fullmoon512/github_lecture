import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Inventory from '../src/state/inventory.js';
import { itemOrder, itemName } from '../src/data/items.js';

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));
const order = itemOrder(config);

test('품목 순서: 작물 → 요리 → 선물, 모든 품목에 한글 이름', () => {
  assert.deepEqual(order.slice(0, 3), Object.keys(config.crops));
  assert.equal(order.length, 3 + Object.keys(config.cooking.recipes).length + config.gifts.items.length);
  for (const id of order) assert.notEqual(itemName(id), id, `${id} 이름 없음`);
});

test('가진 것만, config 순서대로', () => {
  const inv = new Inventory();
  assert.deepEqual(inv.list(order), []);
  inv.add('egg', 1);
  inv.add('carrot', 3);
  inv.add('herb_tea', 2);
  inv.add('tomato', 0);
  assert.deepEqual(inv.list(order), [
    { id: 'carrot', count: 3 },
    { id: 'herb_tea', count: 2 },
    { id: 'egg', count: 1 },
  ]);
});

test('순서표에 없는 품목은 맨 뒤', () => {
  const inv = new Inventory();
  inv.add('mystery', 1);
  inv.add('carrot', 1);
  assert.deepEqual(inv.list(order).map((e) => e.id), ['carrot', 'mystery']);
});
