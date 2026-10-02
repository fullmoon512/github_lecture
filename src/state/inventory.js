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

  // 가진 품목만 [{ id, count }] 로. order 순서대로, order 에 없는 품목은 맨 뒤
  list(order) {
    const known = order.filter((id) => this.count(id) > 0);
    const extra = [...this.items.keys()].filter((id) => !order.includes(id) && this.count(id) > 0);
    return [...known, ...extra].map((id) => ({ id, count: this.count(id) }));
  }
}
