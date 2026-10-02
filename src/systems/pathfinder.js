// 8방향 A* 길찾기. 대각선은 양옆 두 칸이 모두 열려 있을 때만 (모서리 끼어가기 금지).

const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

function octile(ax, ay, bx, by) {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
}

// start → goal 타일 경로(양 끝 포함). 갈 수 없으면 null
export function findPath(grid, start, goal) {
  if (!grid.inBounds(start.x, start.y) || !grid.isWalkable(goal.x, goal.y)) return null;

  const { cols } = grid;
  const n = cols * grid.rows;
  const gScore = new Float64Array(n).fill(Infinity);
  const cameFrom = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const s = start.y * cols + start.x;
  const t = goal.y * cols + goal.x;

  const heap = new MinHeap();
  gScore[s] = 0;
  heap.push(octile(start.x, start.y, goal.x, goal.y), s);

  while (heap.size > 0) {
    const cur = heap.pop();
    if (cur === t) return rebuild(cameFrom, t, cols);
    if (closed[cur]) continue;
    closed[cur] = 1;

    const cx = cur % cols;
    const cy = (cur - cx) / cols;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!grid.isWalkable(nx, ny)) continue;
      const diagonal = dx !== 0 && dy !== 0;
      if (diagonal && !(grid.isWalkable(cx + dx, cy) && grid.isWalkable(cx, cy + dy))) continue;

      const ni = ny * cols + nx;
      if (closed[ni]) continue;
      const g = gScore[cur] + (diagonal ? Math.SQRT2 : 1);
      if (g < gScore[ni]) {
        gScore[ni] = g;
        cameFrom[ni] = cur;
        heap.push(g + octile(nx, ny, goal.x, goal.y), ni);
      }
    }
  }
  return null;
}

// 막힌 칸을 탭했을 때 가장 가까운 걸을 수 있는 칸 (없으면 null)
export function nearestWalkable(grid, tile) {
  const x0 = Math.min(Math.max(tile.x, 0), grid.cols - 1);
  const y0 = Math.min(Math.max(tile.y, 0), grid.rows - 1);
  const maxR = Math.max(grid.cols, grid.rows);
  for (let r = 0; r < maxR; r++) {
    let best = null;
    let bestD = Infinity;
    for (let y = y0 - r; y <= y0 + r; y++) {
      for (let x = x0 - r; x <= x0 + r; x++) {
        if (Math.max(Math.abs(x - x0), Math.abs(y - y0)) !== r) continue;
        if (!grid.isWalkable(x, y)) continue;
        const d = (x - tile.x) ** 2 + (y - tile.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = { x, y };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function rebuild(cameFrom, end, cols) {
  const path = [];
  for (let i = end; i !== -1; i = cameFrom[i]) {
    path.push({ x: i % cols, y: Math.floor(i / cols) });
  }
  return path.reverse();
}

class MinHeap {
  constructor() {
    this.keys = [];
    this.vals = [];
  }

  get size() {
    return this.keys.length;
  }

  push(key, val) {
    const { keys, vals } = this;
    let i = keys.length;
    keys.push(key);
    vals.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (keys[p] <= key) break;
      keys[i] = keys[p];
      vals[i] = vals[p];
      i = p;
    }
    keys[i] = key;
    vals[i] = val;
  }

  pop() {
    const { keys, vals } = this;
    const top = vals[0];
    const lastK = keys.pop();
    const lastV = vals.pop();
    const n = keys.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        if (l >= n) break;
        const r = l + 1;
        const c = r < n && keys[r] < keys[l] ? r : l;
        if (keys[c] >= lastK) break;
        keys[i] = keys[c];
        vals[i] = vals[c];
        i = c;
      }
      keys[i] = lastK;
      vals[i] = lastV;
    }
    return top;
  }
}
