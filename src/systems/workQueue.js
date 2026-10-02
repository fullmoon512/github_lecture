// 고양이 작업 예약. 탭한 순서대로 하나씩: 옆 칸까지 걷기 → 작업 모션 → 실행 → 다음.
// task = { key, standTiles, faceX, canRun(), run(), onEnd() }
export default class WorkQueue {
  constructor(cat) {
    this.cat = cat;
    this.tasks = [];
    this.current = null;
  }

  countFor(key) {
    const queued = this.tasks.filter((t) => t.key === key).length;
    return queued + (this.current?.key === key ? 1 : 0);
  }

  push(task) {
    this.tasks.push(task);
    if (!this.current) this.next();
  }

  // 남은 예약을 모두 버린다. 고양이 동작은 호출한 쪽이 정한다
  // (진행 중이던 작업의 도착·완료 콜백은 current 가 바뀌어 무시된다)
  clear() {
    const dropped = [this.current, ...this.tasks].filter(Boolean);
    this.tasks = [];
    this.current = null;
    dropped.forEach((t) => t.onEnd?.());
  }

  next() {
    const task = this.tasks.shift();
    this.current = task ?? null;
    if (!task) return;
    if (!task.canRun()) {
      this.finish(task);
      return;
    }

    const goal = this.cat.walkToNearest(task.standTiles, () => {
      if (this.current !== task) return;
      if (!task.canRun()) {
        this.finish(task);
        return;
      }
      this.cat.work(task.faceX, () => {
        if (this.current !== task) return;
        task.run();
        this.finish(task);
      });
    });
    if (!goal) this.finish(task);
  }

  finish(task) {
    this.current = null;
    task.onEnd?.();
    this.next();
  }
}
