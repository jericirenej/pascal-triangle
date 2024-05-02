# Pascal triangle

Simple CLI helper to create values of binomial coefficients for a specific row or range of rows.

To install dependencies, run `bun install`. Run tests with `bun test`, or build the script with `bun run build`

## Usage

```
command <row>           Show factors for target level

command <row> <row>     Show factors in range

command help            Print this message
```

- When specifying the range, it does not matter which argument specifies the lower or upper range.
- Ranges are inclusive.
- If more than two arguments are supplied, they will be ignored.
- Negative integers will be converted to absolute values.
- Floats are not permitted and will throw.
- Values that cannot be converted to integers will throw.

## Example output

```
bun run src/index.ts 5

 5:     1 5 10 10 5 1

bun run src/index.ts 0 10

 0:     1
 1:     1 1
 2:     1 2 1
 3:     1 3 3 1
 4:     1 4 6 4 1
 5:     1 5 10 10 5 1
 6:     1 6 15 20 15 6 1
 7:     1 7 21 35 35 21 7 1
 8:     1 8 28 56 70 56 28 8 1
 9:     1 9 36 84 126 126 84 36 9 1
10:     1 10 45 120 210 252 210 120 45 10 1
```
