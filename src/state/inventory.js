// 창고: 아이템 id → 개수. 5단계 창고 화면이 이 데이터를 보여준다
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
}
