import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import DayClock, { PHASES } from '../src/state/dayClock.js';
import { rollWeather, WEATHER_TYPES } from '../src/state/weather.js';
import Farm, { ACTION } from '../src/state/farm.js';

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));

test('config: 시간대 합 = 하루 길이, 날씨 확률 합 = 1', () => {
  const sum = PHASES.reduce((s, p) => s + config.time.phases[p], 0);
  assert.equal(sum, config.time.dayLengthSec);
  const w = WEATHER_TYPES.reduce((s, k) => s + config.weather[k], 0);
  assert.ok(Math.abs(w - 1) < 1e-9);
  assert.ok(WEATHER_TYPES.includes(config.weather.firstDay));
});

test('시간대는 경계에서 바뀐다', () => {
  const c = new DayClock(config.time);
  const { morning, day, evening } = config.time.phases;
  assert.equal(c.phase(), 'morning');
  c.tick(morning - 0.01);
  assert.equal(c.phase(), 'morning');
  c.tick(0.01);
  assert.equal(c.phase(), 'day');
  c.tick(day);
  assert.equal(c.phase(), 'evening');
  c.tick(evening);
  assert.equal(c.phase(), 'night');
});

test('하루 길이가 다 지나면(밤이 끝나면) 한 번만 끝 신호', () => {
  const c = new DayClock(config.time);
  assert.equal(c.tick(config.time.dayLengthSec - 1), false);
  assert.equal(c.tick(5), true);
  assert.equal(c.tick(5), false, '이미 끝난 하루는 다시 신호를 주지 않는다');
  assert.equal(c.elapsedSec, config.time.dayLengthSec);
  c.nextDay();
  assert.equal(c.day, 2);
  assert.equal(c.phase(), 'morning');
  assert.equal(c.ended, false);
});

test('날씨 확률표', () => {
  const w = config.weather;
  assert.equal(rollWeather(w, () => 0), 'sunny');
  assert.equal(rollWeather(w, () => w.sunny - 0.001), 'sunny');
  assert.equal(rollWeather(w, () => w.sunny + 0.001), 'cloudy');
  assert.equal(rollWeather(w, () => 0.9999), 'rain');
  // 고정 난수열로 대략적인 비율 확인
  let seed = 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const n = 20000;
  const counts = { sunny: 0, cloudy: 0, rain: 0 };
  for (let i = 0; i < n; i++) counts[rollWeather(w, rand)]++;
  for (const k of WEATHER_TYPES) assert.ok(Math.abs(counts[k] / n - w[k]) < 0.02, k);
});

test('비 오는 날: 심은 칸만 물, 빈 칸·다 자란 칸은 그대로', () => {
  const f = new Farm(config, 4);
  f.perform(0, ACTION.PLANT, 'carrot');
  f.perform(1, ACTION.PLANT, 'carrot');
  for (let d = 0; d < config.crops.carrot.growDays; d++) {
    f.perform(1, ACTION.WATER, 'carrot');
    f.advanceDay();
  }
  f.waterAll();
  assert.equal(f.plots[0].watered, true);
  assert.equal(f.plots[1].watered, false, '다 자란 칸');
  assert.equal(f.plots[2].watered, false, '빈 칸');
});
