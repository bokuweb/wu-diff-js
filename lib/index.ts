interface FarthestPoint {
  y: number;
  id: number;
}

export type DiffType = 'common' | DiffChangedType;

export type DiffChangedType = 'removed' | 'added';

export type DiffResult<T> =
  | {
      type: DiffChangedType;
      value: T;
    }
  | {
      type: 'common';
      value: [T, T];
    };

/**
 * Legacy DiffResult
 */
export type FlattenDiffResult<T> = {
  type: DiffType;
  value: T;
};

// HACK: Avoid invalid array length
// https://stackoverflow.com/questions/37421749/is-there-an-item-limit-for-large-arrays-in-javascript#:~:text=In%20Chrome%20maximum%20array%20size%20is%20something%20between%201e9%20and%201e10.&text=And%20crashing%20is%20not%20related,with%20a%20normal%20loop%20too
const CHUNK_SIZE = 50000000;

const REMOVED = 1;
const COMMON = 2;
const ADDED = 3;

const chunkIndex = (ptr: number): number => {
  return ~~(ptr / CHUNK_SIZE);
};

function createCommon<T>(A: T[], B: T[], reverse?: boolean, eq = (a: T, b: T) => a === b): [T, T][] {
  const common: [T, T][] = [];
  if (A.length === 0 || B.length === 0) return [];
  for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
    const a = A[reverse ? A.length - i - 1 : i];
    const b = B[reverse ? B.length - i - 1 : i];
    if (eq(a, b)) {
      common.push([a, b]);
    } else {
      return common;
    }
  }
  return common;
}

export function diff<T>(A: T[], B: T[], eq = (a: T, b: T) => a === b): DiffResult<T>[] {
  function backTrace<T>(A: T[], B: T[], current: FarthestPoint, swapped: boolean): DiffResult<T>[] {
    const M = A.length;
    const N = B.length;
    const result = [];
    let a = M - 1;
    let b = N - 1;
    const idChunkIndex = chunkIndex(current.id);
    let j = routes[idChunkIndex][current.id % CHUNK_SIZE];
    let type = types[idChunkIndex][current.id % CHUNK_SIZE];
    while (true) {
      if (!j && !type) break;
      const prev = j;
      if (type === REMOVED) {
        result.unshift({ type: (swapped ? 'removed' : 'added') as DiffChangedType, value: B[b] });
        b -= 1;
      } else if (type === ADDED) {
        result.unshift({ type: (swapped ? 'added' : 'removed') as DiffChangedType, value: A[a] });
        a -= 1;
      } else {
        result.unshift({ type: 'common' as const, value: (swapped ? [B[b], A[a]] : [A[a], B[b]]) as [T, T] });
        a -= 1;
        b -= 1;
      }
      const index = chunkIndex(prev);
      j = routes[index][prev % CHUNK_SIZE];
      type = types[index][prev % CHUNK_SIZE];
    }
    return result;
  }

  function createFP(slide: FarthestPoint, down: FarthestPoint, k: number, M: number): FarthestPoint {
    if (slide && slide.y === -1 && down && down.y === -1) return { y: 0, id: 0 };
    if ((down && down.y === -1) || k === M || (slide && slide.y) > (down && down.y) + 1) {
      const prev = slide.id;
      ptr++;
      const index = chunkIndex(ptr);
      routes[index][ptr % CHUNK_SIZE] = prev;
      types[index][ptr % CHUNK_SIZE] = ADDED;
      return { y: slide.y, id: ptr };
    } else {
      const prev = down.id;
      ptr++;
      const index = chunkIndex(ptr);
      routes[index][ptr % CHUNK_SIZE] = prev;
      types[index][ptr % CHUNK_SIZE] = REMOVED;
      return { y: down.y + 1, id: ptr };
    }
  }

  function snake(k: number, slide: FarthestPoint, down: FarthestPoint, A: T[], B: T[]) {
    const M = A.length;
    const N = B.length;
    if (k < -N || M < k) return { y: -1 };
    const fp = createFP(slide, down, k, M);
    while (fp.y + k < M && fp.y < N && eq(A[fp.y + k], B[fp.y])) {
      const prev = fp.id;
      ptr++;
      fp.id = ptr;
      fp.y += 1;
      const index = chunkIndex(ptr);
      routes[index][ptr % CHUNK_SIZE] = prev;
      types[index][ptr % CHUNK_SIZE] = COMMON;
    }
    return fp;
  }

  const prefixCommon = createCommon(A, B, undefined, eq);
  const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true, eq).reverse();
  A = suffixCommon.length ? A.slice(prefixCommon.length, -suffixCommon.length) : A.slice(prefixCommon.length);
  B = suffixCommon.length ? B.slice(prefixCommon.length, -suffixCommon.length) : B.slice(prefixCommon.length);
  const swapped = B.length > A.length;
  [A, B] = swapped ? [B, A] : [A, B];
  const M = A.length;
  const N = B.length;
  if (!M && !N && !suffixCommon.length && !prefixCommon.length) return [];
  if (!N) {
    return [
      ...prefixCommon.map(([a, b]) => ({ type: 'common' as const, value: [a, b] as [T, T] })),
      ...A.map(a => ({ type: (swapped ? 'added' : 'removed') as DiffChangedType, value: a })),
      ...suffixCommon.map(([a, b]) => ({ type: 'common' as const, value: [a, b] as [T, T] })),
    ];
  }
  const offset = N;
  const delta = M - N;
  const size = M + N + 1;
  const arrSize = M * N + size + 1;
  const numberOfChunks = Math.ceil(arrSize / CHUNK_SIZE);

  let fp = new Array(size).fill({ y: -1 });

  let routes: number[][] = [...new Array(numberOfChunks)].map(() => new Array(CHUNK_SIZE));
  let types: number[][] = [...new Array(numberOfChunks)].map(() => new Array(CHUNK_SIZE));
  let ptr = 0;
  let p = -1;
  while (fp[delta + offset].y < N) {
    p = p + 1;
    for (let k = -p; k < delta; ++k) {
      fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], A, B);
    }
    for (let k = delta + p; k > delta; --k) {
      fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], A, B);
    }
    fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], A, B);
  }
  const pre = prefixCommon.map(([a, b]) => ({ type: 'common' as const, value: [a, b] as [T, T] }));
  const traced = backTrace(A, B, fp[delta + offset], swapped);
  const suf = suffixCommon.map(([a, b]) => ({ type: 'common' as const, value: [a, b] as [T, T] }));

  // cleanup
  (routes as any) = null;
  (fp as any) = null;

  if ('flat' in Array.prototype) {
    return [pre, traced, suf].flat();
  } else {
    return [...pre, ...traced, ...suf];
  }
}
