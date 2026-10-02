// 타일 단위로 걸을 수 있는지 기록하는 격자. 집·조리대 같은 물체가 생기면 setBlocked 로 막는다.
export default class WalkGrid {
  constructor(cols, rows, tileSize) {
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;
    this.blocked = new Uint8Array(cols * rows);
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  isWalkable(x, y) {
    return this.inBounds(x, y) && this.blocked[y * this.cols + x] === 0;
  }

  setBlocked(x, y, blocked = true) {
    if (this.inBounds(x, y)) this.blocked[y * this.cols + x] = blocked ? 1 : 0;
  }

  worldToTile(wx, wy) {
    return { x: Math.floor(wx / this.tileSize), y: Math.floor(wy / this.tileSize) };
  }

  tileCenter(x, y) {
    return { x: (x + 0.5) * this.tileSize, y: (y + 0.5) * this.tileSize };
  }
}

// 직사각형(타일 tx, ty, 너비 w, 높이 h) 네 변에 붙은 타일들. 물체 옆에 서서 작업할 자리
export function sideTiles(tx, ty, w, h) {
  const tiles = [];
  for (let k = 0; k < w; k++) tiles.push({ x: tx + k, y: ty - 1 }, { x: tx + k, y: ty + h });
  for (let k = 0; k < h; k++) tiles.push({ x: tx - 1, y: ty + k }, { x: tx + w, y: ty + k });
  return tiles;
}
