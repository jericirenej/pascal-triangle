export const numToSequence = (num: number): number[] => {
  if (num < 0 || !Number.isInteger(num)) {
    throw new Error("Supply integer that is >= 0");
  }
  return new Array(num).fill(0).map((_, i) => i + 1);
};

export const cachedFactorial = (
  factorialCache = new Map<number, number>([[0, 1]]),
): ((num: number) => number) => {
  return (num: number) => {
    if (factorialCache.has(num)) {
      return factorialCache.get(num) as number;
    }
    const baseIndex = factorialCache.size - 1;
    numToSequence(num)
      .slice(baseIndex)
      .forEach(el => {
        const val = (factorialCache.get(el - 1) as number) * el;
        factorialCache.set(el, val);
      });
    return factorialCache.get(num) as number;
  };
};
export const factorial = cachedFactorial();

export const binomialCoefficient = (n: number, k: number) => {
  if ([n, k].some(n => !Number.isInteger(n)) || k < 0 || n < 0) {
    throw new Error("Supply two integers");
  }
  if (k > n) {
    throw new Error("k must be <= n");
  }
  return factorial(n) / (factorial(k) * factorial(n - k));
};
export const generateFactors = (row: number): number[] => {
  if (row === 0) return [1];
  const adjustedRow = row + 1;
  // Because the binomial divisors that come after the middle point are just
  // reversed initial entries, we can save some computation cycles here.
  const isOdd = adjustedRow % 2 !== 0,
    cutoff = Math.ceil(adjustedRow / 2);
  const leftSide: number[] = [];
  for (let i = 0; i < cutoff; i++) {
    leftSide.push(binomialCoefficient(row, i));
  }

  const rightSide = [...leftSide].reverse().slice(Number(isOdd));
  return [...leftSide, ...rightSide];
};
