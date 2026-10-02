import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tintAt, phaseBlend } from '../src/state/dayTint.js';

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));
const time = config.time;
const COLORS = { morning: 0xffff00, day: 0xffffff, evening: 0xff8000, night: 0x000080 };
const { morning, day, evening } = time.phases;
const half = time.tint.transitionSec / 2;

test('각 시간대 한가운데는 그 시간대 색·진하기', () => {
  assert.deepEqual(tintAt(morning / 2, time, COLORS), { color: COLORS.morning, alpha: time.tint.morning });
  assert.equal(tintAt(morning + day / 2, time, COLORS).alpha, 0, '낮은 색 없음');
  assert.deepEqual(tintAt(morning + day + evening / 2, time, COLORS), { color: COLORS.evening, alpha: time.tint.evening });
  assert.deepEqual(tintAt(time.dayLengthSec - 1, time, COLORS), { color: COLORS.night, alpha: time.tint.night });
});

test('하루 시작(아침 첫 순간)은 섞지 않고 바로 아침', () => {
  assert.deepEqual(phaseBlend(0, time.phases, time.tint.transitionSec), { from: 'morning', to: 'morning', t: 0 });
});

test('경계에서는 두 시간대가 반반, 앞뒤로 부드럽게', () => {
  const b = morning + day + evening; // 저녁 → 밤
  assert.deepEqual(phaseBlend(b, time.phases, time.tint.transitionSec), { from: 'evening', to: 'night', t: 0.5 });
  const before = tintAt(b - half, time, COLORS).alpha;
  const mid = tintAt(b, time, COLORS).alpha;
  const after = tintAt(b + half, time, COLORS).alpha;
  assert.ok(Math.abs(before - time.tint.evening) < 1e-9);
  assert.ok(Math.abs(mid - (time.tint.evening + time.tint.night) / 2) < 1e-9);
  assert.ok(Math.abs(after - time.tint.night) < 1e-9);
});

test('낮과 섞일 때도 색은 상대 시간대 색 그대로 (하얗게 바래지 않음)', () => {
  const t = tintAt(morning + 2, time, COLORS); // 아침 → 낮, 낮 쪽으로 넘어가는 중
  assert.equal(t.color, COLORS.morning);
  assert.ok(t.alpha > 0 && t.alpha < time.tint.morning);
});

test('진하기는 하루 내내 0 이상, 밤 진하기 이하', () => {
  const max = Math.max(...['morning', 'day', 'evening', 'night'].map((p) => time.tint[p]));
  for (let s = 0; s <= time.dayLengthSec; s += 0.5) {
    const { alpha } = tintAt(s, time, COLORS);
    assert.ok(alpha >= 0 && alpha <= max + 1e-9, `${s}s: ${alpha}`);
  }
});
