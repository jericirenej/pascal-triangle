import { generateFactors, numToSequence } from "./calculations";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};
const colorize = (
  message: string,
  color: "red" | "yellow" | "green",
): string => {
  const colorProp = COLORS[color];
  return `${colorProp}${message}${COLORS.reset}`;
};
export const MESSAGES = {
  invalidArgs: colorize("Please supply integers", "red"),
  extraArgumentsIgnore: colorize("Ignoring extra arguments...", "yellow"),
  absoluteValueUsed: colorize(
    "Negative integers passed. Using absolute values...",
    "yellow",
  ),
  usage: (argv: string[]): string => {
    const command = argv[1].split("/").at(-1);
    let message = `${colorize("Pascal triangle generator", "green")}\n\n`;
    message += `${command} <row>\t\t Show factors for target level\n\n`;
    message += `${command} <row> <row>\t Show factors in range\n\n`;
    message += `${command} help\t\t Print this message\n`;
    return message;
  },
};

export const transformToNumbers = (args: unknown[]): number[] => {
  if (args.length > 2) {
    console.log(MESSAGES.extraArgumentsIgnore);
  }
  const reducedArgs = args.slice(0, 2);
  let negativeValues = false;
  const transformedArgs = reducedArgs.map(arg => {
    let num = Number(arg);
    if (Number.isNaN(num) || !Number.isInteger(num)) {
      throw new Error(MESSAGES.invalidArgs);
    }
    if (num < 0) {
      num = Math.abs(num);
      negativeValues = true;
    }
    return num;
  });
  if (negativeValues) {
    console.log(MESSAGES.absoluteValueUsed);
  }
  return transformedArgs;
};

export const handleArgs = (argv: string[]): string[] => {
  const suppliedArgs = argv.slice(2);
  if (!suppliedArgs.length || suppliedArgs[0].includes("help")) {
    console.log(MESSAGES.usage(argv));
    process.exit(0);
  }
  try {
    const range = transformToNumbers(suppliedArgs);
    if (range.length === 1) {
      return [`${range[0]}:\t${generateFactors(range[0]).join(" ")}`];
    }
    const result: string[] = [];
    const [from, to] = range,
      start = from <= to ? from : to,
      end = start === from ? to : from,
      maxLength = end.toString().length;
    const sequence = [0, ...numToSequence(end)].slice(start);
    sequence.forEach(val => {
      // Ensure all prefix labels consume the same amount of space
      const diffToMax = maxLength - val.toString().length;
      const prefix = `${new Array(diffToMax).fill(" ").join("")}${val}:\t`,
        factors = generateFactors(val).join(" ");
      result.push([prefix, factors].join(""));
    });
    return result;
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
};
