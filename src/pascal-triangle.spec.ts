import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  spyOn,
  type Mock,
} from "bun:test";
import { MESSAGES, handleArgs, transformToNumbers } from "./cli";
import {
  binomialCoefficient,
  cachedFactorial,
  factorial,
  generateFactors,
  numToSequence,
} from "./calculations";

describe("factorial", () => {
  describe("baseFactorial", () => {
    const cache = new Map<number, number>([
      [0, 1],
      [1, 1],
      [2, 2],
      [3, 6],
      [4, 24],
      [5, 120],
    ]);
    it("Pulls from cache", () => {
      const setSpy = spyOn(cache, "set");
      const factorial = cachedFactorial(cache);
      for (const num of [0, 1, 2, 3, 4, 5]) {
        factorial(num);
      }
      expect(setSpy).not.toHaveBeenCalled();
    });
    it("Adds items to cache", () => {
      const setSpy = spyOn(cache, "set");
      const factorial = cachedFactorial(cache);
      for (const num of [6, 7, 8]) {
        factorial(num);
      }
      expect(setSpy).toHaveBeenCalledTimes(3);
    });
  });
  it("factorial calculates value", () => {
    [
      [0, 1],
      [1, 1],
      [2, 2],
      [3, 6],
      [5, 120],
      [7, 5040],
      [10, 3.6288e6],
    ].forEach(([n, expected]) => {
      expect(factorial(n)).toBe(expected);
    });
  });
  it("Throws on invalid input", () => {
    [-1, 1.1].forEach(num => {
      expect(() => factorial(num)).toThrowError();
    });
  });
});

describe("binomialCoefficient", () => {
  it("Calculates coefficients", () => {
    for (const { n, k, expected } of [
      { n: 10, k: 3, expected: 120 },
      { n: 10, k: 2, expected: 45 },
      { n: 10, k: 4, expected: 210 },
      { n: 10, k: 0, expected: 1 },
      { n: 10, k: 10, expected: 1 },
      { n: 5, k: 2, expected: 10 },
    ])
      expect(binomialCoefficient(n, k)).toBe(expected);
  });
  it("Throws on invalid arguments", () => {
    for (const { n, k } of [
      { n: -1, k: 0 },
      { n: 1, k: -1 },
      { n: 1, k: 2 },
      { n: 1.1, k: 1 },
      { n: 1, k: 1.1 },
      { n: 1.1, k: 1.1 },
    ]) {
      expect(() => binomialCoefficient(n, k)).toThrowError();
    }
  });
});
describe("numToSequence", () => {
  it("Produces correct arrays", () => {
    for (const [num, expected] of [
      [0, []],
      [1, [1]],
      [2, [1, 2]],
      [5, [1, 2, 3, 4, 5]],
    ] as [number, number[]][]) {
      expect(numToSequence(num)).toEqual(expected);
    }
  });
  it("throws on invalid arguments", () => {
    [-1, 1.1].forEach(num => {
      expect(() => numToSequence(num)).toThrowError();
    });
  });
});

describe("generateFactors", () => {
  it("Generates factors", () => {
    for (const { power, expected } of [
      { power: 0, expected: [1] },
      { power: 1, expected: [1, 1] },
      { power: 2, expected: [1, 2, 1] },
      { power: 3, expected: [1, 3, 3, 1] },
      { power: 4, expected: [1, 4, 6, 4, 1] },
      {
        power: 14,
        expected: [
          1, 14, 91, 364, 1001, 2002, 3003, 3432, 3003, 2002, 1001, 364, 91, 14,
          1,
        ],
      },
      {
        power: 15,
        expected: [
          1, 15, 105, 455, 1365, 3003, 5005, 6435, 6435, 5005, 3003, 1365, 455,
          105, 15, 1,
        ],
      },
    ]) {
      expect(generateFactors(power)).toEqual(expected);
    }
  });
});

describe("CLI handlers", () => {
  let logSpy: Mock<typeof console.log>,
    warnSpy: Mock<typeof console.warn>,
    errorSpy: Mock<typeof console.error>,
    spyOnExit: Mock<typeof process.exit>;
  const baseArgv = [
    "/path/to/target/executor",
    "/path/to/target/file-name.ext",
  ];
  const setSpies = () => {
    logSpy = spyOn(console, "log").mockImplementation(
      (...args: unknown[]) => {},
    );
    warnSpy = spyOn(console, "log").mockImplementation(
      (...args: unknown[]) => {},
    );
    errorSpy = spyOn(console, "error").mockImplementation(
      (...args: unknown[]) => {},
    );
    spyOnExit = spyOn(process, "exit").mockImplementation(
      (code: number | undefined) => {
        throw new Error(code?.toString());
      },
    );
  };
  const clearSpies = () => {
    [logSpy, warnSpy, errorSpy].forEach(spy => spy.mockRestore());
  };
  describe("transformToNumbers", () => {
    beforeEach(() => {
      setSpies();
    });
    afterEach(() => {
      clearSpies();
    });
    it("transformToNumbers transforms stringified numbers into absolute values", () => {
      const testCases: { input: string[]; output: number[] }[] = [
        { input: ["0", "1"], output: [0, 1] },
        { input: ["-5", "-3"], output: [5, 3] },
        { input: ["1", "2", "3"], output: [1, 2] },
      ];
      testCases.forEach(({ input, output }) => {
        expect(transformToNumbers(input)).toEqual(output);
      });
    });
    it("transformToNumbers throws on invalid input", () => {
      [
        ["invalid", 2],
        [1.1, 2],
      ].forEach(args => {
        expect(() => transformToNumbers(args)).toThrowError(
          MESSAGES.invalidArgs,
        );
      });
    });
    it("transformToNumbers warns on unusual input", () => {
      const { absoluteValueUsed, extraArgumentsIgnore } = MESSAGES;
      const correctArgs = ["1", "2"],
        manyArgs = ["1", "2", "3"],
        negativeArgs = ["1", "-2"],
        combinedArgs = ["1", "-2", "3"];
      const testCases: { args: string[]; calls: string[] }[] = [
        { args: correctArgs, calls: [] },
        { args: manyArgs, calls: [extraArgumentsIgnore] },
        { args: negativeArgs, calls: [absoluteValueUsed] },
        {
          args: combinedArgs,
          calls: [extraArgumentsIgnore, absoluteValueUsed],
        },
      ];
      for (const { args, calls } of testCases) {
        warnSpy.mockClear();
        transformToNumbers(args);
        expect(warnSpy).toHaveBeenCalledTimes(calls.length);
        if (!calls.length) continue;
        calls.forEach((call, i) => {
          expect(warnSpy).toHaveBeenNthCalledWith(i + 1, call);
        });
      }
    });
  });
  describe("handleArgs", () => {
    beforeEach(() => {
      setSpies();
    });
    afterEach(() => {
      clearSpies();
    });
    it("Shows help if no args are supplied or help keyword is used", () => {
      for (const args of [[], ["help"]]) {
        logSpy.mockClear();
        const completeArgs = [...baseArgv, ...args];
        expect(() => handleArgs(completeArgs)).toThrowError("0");
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenLastCalledWith(MESSAGES.usage(completeArgs));
      }
    });
    it("Propagates errors from transformToNumbers", () => {
      ["invalid", "1.1"].forEach(args => {
        expect(() => handleArgs([...baseArgv, args])).toThrowError();
      });
    });
    it("Returns a single entry", () => {
      const result = handleArgs([...baseArgv, "10"]);
      const factors = generateFactors(10).join(" ");
      expect(result).toEqual([`10:\t${factors}`]);
    });
    it("Returns a range of entries", () => {
      const result = handleArgs([...baseArgv, "0", "10"]);
      const sequence = [0, ...numToSequence(10)];
      const factors = sequence.map(n => {
        const label = n.toString().padStart(2, " ");
        return `${label}:\t${generateFactors(n).join(" ")}`;
      });
      expect(result).toEqual(factors);
    });
    it("Should handle mixed start and end arguments", () => {
      const result = handleArgs([...baseArgv, "5", "4"]);

      const factors = [4, 5].map(n => `${n}:\t${generateFactors(n).join(" ")}`);
      expect(result).toEqual(factors);
    });
  });
});
