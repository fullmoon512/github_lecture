// 텃밭 데이터 (화면과 무관한 순수 로직).
// 칸 하나: { crop: 작물 id 또는 null, growth: 자란 날 수, watered: 오늘 물 줬는지 }

export const ACTION = { PLANT: 'plant', WATER: 'water', HARVEST: 'harvest' };

export default class Farm {
  constructor({ crops, growth, harvest }, plotCount) {
    this.crops = crops;
    this.needsWater = growth.needsWaterToGrow;
    this.yield = harvest.yield;
    this.plots = Array.from({ length: plotCount }, () => emptyPlot());
  }

  isReady(i) {
    return this.ready(this.plots[i]);
  }

  // 0(막 심음) ~ 1(다 자람)
  progress(i) {
    const p = this.plots[i];
    if (p.crop === null) return 0;
    return Math.min(p.growth / this.crops[p.crop].growDays, 1);
  }

  // 지금 이 칸에서 할 일. seed 는 빈 밭에 심을 작물
  nextAction(i, seed) {
    return actionFor(this.plots[i], this.ready(this.plots[i]), seed);
  }

  // 이 칸을 연달아 탭했을 때 차례로 일어날 행동들 (예약 가능한 횟수 계산용)
  plannedActions(i, seed) {
    const p = { ...this.plots[i] };
    const actions = [];
    for (;;) {
      const a = actionFor(p, this.ready(p), seed);
      if (a === null) return actions;
      actions.push(a);
      applyAction(p, a, seed);
    }
  }

  // 행동 실행. 수확이면 { crop, amount } 를 돌려준다
  perform(i, action, seed) {
    const p = this.plots[i];
    if (actionFor(p, this.ready(p), seed) !== action) return null;
    const harvested = action === ACTION.HARVEST ? { crop: p.crop, amount: this.yield } : null;
    applyAction(p, action, seed);
    return harvested;
  }

  // 하루가 끝날 때: 물 준 칸만 +1 (needsWaterToGrow 가 false 면 심은 칸 모두). 시들지 않는다
  advanceDay() {
    for (let i = 0; i < this.plots.length; i++) {
      const p = this.plots[i];
      if (p.crop !== null && !this.isReady(i) && (p.watered || !this.needsWater)) p.growth += 1;
      p.watered = false;
    }
  }

  ready(p) {
    return p.crop !== null && p.growth >= this.crops[p.crop].growDays;
  }
}

function emptyPlot() {
  return { crop: null, growth: 0, watered: false };
}

function actionFor(p, ready, seed) {
  if (p.crop === null) return seed ? ACTION.PLANT : null;
  if (ready) return ACTION.HARVEST;
  if (!p.watered) return ACTION.WATER;
  return null;
}

function applyAction(p, action, seed) {
  if (action === ACTION.PLANT) {
    p.crop = seed;
    p.growth = 0;
    p.watered = false;
  } else if (action === ACTION.WATER) {
    p.watered = true;
  } else if (action === ACTION.HARVEST) {
    Object.assign(p, emptyPlot());
  }
}
