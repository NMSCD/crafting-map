export function haveCommonElements<T>(arrA: T[], arrB: T[]) {
  return arrA.some((a) => {
    return arrB.some((b) => {
      return a === b;
    });
  });
}

export function randomNum(min = 0, max = 100) {
  return (Math.random() * (max - min + 1)) << 0;
}

export function setRandomInterval(cb: () => void, min: number, max: number) {
  let timeout: number;
  const tick = () => {
    timeout = setTimeout(() => {
      cb();
      tick();
    }, randomNum(min, max));
  };

  tick();

  return { stop: () => clearTimeout(timeout) };
}

export function clamp(value: number, lo: number, hi: number) {
  return value < lo ? lo : value > hi ? hi : value;
}

export function assert(value: unknown, error?: string): asserts value {
  if (!value) {
    throw new Error(error || "AssertionError");
  }
}
