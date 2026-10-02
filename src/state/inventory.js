// 창고: 아이템 id → 개수
export default class Inventory {
  constructor() {
    this.items = new Map();
  }

  add(id, amount) {
    this.items.set(id, this.count(id) + amount);
  }

  count(id) {
    return this.items.get(id) ?? 0;
  }

  // needs = { 아이템 id: 개수 } 를 모두 가지고 있는지
  has(needs) {
    return Object.entries(needs).every(([id, n]) => this.count(id) >= n);
  }

  // 모두 있을 때만 한꺼번에 꺼낸다. 꺼냈으면 true
  take(needs) {
    if (!this.has(needs)) return false;
    for (const [id, n] of Object.entries(needs)) this.items.set(id, this.count(id) - n);
    return true;
  }

  // 꺼냈던 것을 되돌려 놓는다 (예약 취소 등)
  give(needs) {
    for (const [id, n] of Object.entries(needs)) this.add(id, n);
  }

  // 가진 품목만 [{ id, count }] 로. order 순서대로, order 에 없는 품목은 맨 뒤
  list(order) {
    const known = order.filter((id) => this.count(id) > 0);
    const extra = [...this.items.keys()].filter((id) => !order.includes(id) && this.count(id) > 0);
    return [...known, ...extra].map((id) => ({ id, count: this.count(id) }));
  }
}
