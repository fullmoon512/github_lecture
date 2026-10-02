// 먹이자리 칸들. 칸마다 올려 둔 음식 id 또는 null.
// 올려 둔 음식은 동물이 먹기 전까지(10단계) 하루가 지나도 그대로 남는다
export default class FeedSpots {
  constructor(count) {
    this.spots = Array.from({ length: count }, () => null);
  }

  get(i) {
    return this.spots[i];
  }

  // 음식을 올린다. 원래 있던 음식(창고로 되돌릴 것)을 돌려준다
  place(i, itemId) {
    const prev = this.spots[i];
    this.spots[i] = itemId;
    return prev;
  }

  // 올려 둔 음식을 내린다. 내린 음식(창고로 되돌릴 것)을 돌려준다
  remove(i) {
    return this.place(i, null);
  }
}
