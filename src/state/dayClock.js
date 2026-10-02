// 하루 시계. 시계는 분위기 연출 전용이고 성장과는 무관하다 (성장은 하루가 끝날 때)
export const PHASES = ['morning', 'day', 'evening', 'night'];

export default class DayClock {
  constructor({ dayLengthSec, phases }) {
    this.lengthSec = dayLengthSec;
    this.phases = phases;
    this.day = 1;
    this.elapsedSec = 0;
  }

  get ended() {
    return this.elapsedSec >= this.lengthSec;
  }

  // 시간을 흘린다. 이번 호출로 하루가 끝났으면 true (한 번만)
  tick(sec) {
    if (this.ended) return false;
    this.elapsedSec = Math.min(this.elapsedSec + sec, this.lengthSec);
    return this.ended;
  }

  // 지금 시간대: morning / day / evening / night (8단계 색 필터에서 사용)
  phase() {
    let t = this.elapsedSec;
    for (const name of PHASES) {
      if (t < this.phases[name]) return name;
      t -= this.phases[name];
    }
    return PHASES[PHASES.length - 1];
  }

  nextDay() {
    this.day += 1;
    this.elapsedSec = 0;
  }
}
