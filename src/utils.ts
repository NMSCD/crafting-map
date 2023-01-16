export function haveCommonElements(arrA, arrB) {
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
  let timeout;
  const tick = () => {
    timeout = setTimeout(() => {
      cb();
      tick();
    }, randomNum(min, max));
  };

  tick();

  return { stop: () => clearTimeout(timeout) };
}
