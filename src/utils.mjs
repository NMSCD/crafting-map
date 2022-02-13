export function haveCommonElements(arrA, arrB) {
  return arrA.some((a) => {
    return arrB.some((b) => {
      return a === b;
    });
  });
}
