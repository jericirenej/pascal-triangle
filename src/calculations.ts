export const numToSequence = (num: number): number[] => {
  if (num < 0 || !Number.isInteger(num)) {
    throw new Error("Supply integer that is >= 0");
  }
  return new Array(num).fill(0).map((_, i) => i + 1);
};
export const factorial = (num: number): number => {
  if (num === 0) return 1;
  let result = 1;
  numToSequence(num).forEach(el => {
    result *= el;
  });
  return result;
};

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
