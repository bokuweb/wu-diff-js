const range = (n: number) => Array.from(Array(n).keys());

interface FarthestPoint {
  y: number;
  tree?: Tree;
}

interface Tree {
  prev?: Tree;
  type?: -1 | 0 | 1;
}

export type DiffType = 'removed' | 'common' | 'added';

export interface DiffResult<T> {
  type: DiffType;
  value: T;
}

const REMOVED = -1;
const COMMON = 0;
const ADDED = 1;

function backTrace<T>(A: T[], B: T[], current: FarthestPoint, swapped: boolean) {
  const M = A.length;
  const N = B.length;
  const result = [];
  let a = M - 1;
  let b = N - 1;
  for (let j = current.tree; typeof j !== 'undefined'; j = j.prev) {
    if (j.type === ADDED) {
      result.unshift({ type: (swapped ? 'removed' : 'added') as DiffType, value: B[b] });
      b -= 1;
    } else if (j.type === REMOVED) {
      result.unshift({ type: (swapped ? 'added' : 'removed') as DiffType, value: A[a] });
      a -= 1;
    } else {
      result.unshift({ type: 'common' as DiffType, value: A[a] });
      a -= 1;
      b -= 1;
    }
  }
  return result;
}

function createFP(slide: FarthestPoint, down: FarthestPoint, k: number, M: number, N: number): FarthestPoint {
  if (slide.y === -1 && down.y === -1) return { y: 0 };
  return down.y === -1 || k === M || slide.y > down.y + 1
    ? { y: slide.y, tree: { type: REMOVED, prev: slide.tree } }
    : { y: down.y + 1, tree: { type: ADDED, prev: down.tree } };
}

function snake<T>(k: number, slide: FarthestPoint, down: FarthestPoint, offset: number, A: T[], B: T[]) {
  const M = A.length;
  const N = B.length;
  if (k < -N || M < k) return { y: -1 };
  const fp = createFP(slide, down, k, M, N);
  while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
    fp.tree = { type: COMMON, prev: fp.tree };
    fp.y += 1;
  }
  return fp;
}

export default function diff<T>(A: T[], B: T[]): DiffResult<T>[] {
  let M = A.length;
  let N = B.length;
  const swapped = N > M;
  [A, B] = swapped ? [B, A] : [A, B];
  M = A.length;
  N = B.length;
  if (M === 0 && N === 0) return [];
  if (N === 0) return A.map(a => ({ type: (swapped ? 'added' : 'removed') as DiffType, value: a }));
  const offset = N;
  const delta = M - N;
  const size = M + N + 1;
  const fp: FarthestPoint[] = new Array(size).fill({ y: -1 });
  let p = -1;
  while (fp[delta + offset].y < N) {
    p = p + 1;
    for (let k = -p; k < delta; k += 1) {
      fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
    }
    for (let k = delta + p; k > delta; k -= 1) {
      fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
    }
    fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
  }
  return backTrace(A, B, fp[delta + offset], swapped);
}
