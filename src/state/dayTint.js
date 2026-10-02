import { PHASES } from './dayClock.js';

// 지금 시각(하루 시작부터 elapsedSec)의 화면 색.
// 시간대 경계 앞뒤 transitionSec/2 동안 두 시간대 색을 섞는다. 돌려주는 값: { color: 0xRRGGBB, alpha }
// time = config.time, colors = { morning, day, evening, night } 색
export function tintAt(elapsedSec, time, colors) {
  const { from, to, t } = phaseBlend(elapsedSec, time.phases, time.tint.transitionSec);
  const aFrom = time.tint[from] * (1 - t);
  const aTo = time.tint[to] * t;
  const alpha = aFrom + aTo;
  if (alpha === 0) return { color: colors[to], alpha: 0 };
  // 진하기로 가중한 색 섞기: 색 없는 시간대(낮)와 섞일 때 색이 하얗게 바래지 않도록
  return { color: mixColor(colors[from], colors[to], aTo / alpha), alpha };
}

// 지금 어느 시간대에서 어느 시간대로 얼마나(t: 0~1) 넘어가는 중인지
export function phaseBlend(elapsedSec, phases, transitionSec) {
  const half = transitionSec / 2;
  let start = 0;
  for (let k = 0; k < PHASES.length; k++) {
    const p = PHASES[k];
    const end = start + phases[p];
    if (elapsedSec < end || k === PHASES.length - 1) {
      const prev = PHASES[k - 1];
      const next = PHASES[k + 1];
      if (next && elapsedSec > end - half) {
        return { from: p, to: next, t: (elapsedSec - (end - half)) / transitionSec };
      }
      if (prev && elapsedSec < start + half) {
        return { from: prev, to: p, t: 0.5 + (elapsedSec - start) / transitionSec };
      }
      return { from: p, to: p, t: 0 };
    }
    start = end;
  }
  return { from: PHASES[0], to: PHASES[0], t: 0 };
}

function mixColor(a, b, t) {
  const ch = (c, s) => (c >> s) & 0xff;
  const lerp = (s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t);
  return (lerp(16) << 16) | (lerp(8) << 8) | lerp(0);
}
