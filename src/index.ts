import { handleArgs } from "./cli";

const result = handleArgs(process.argv);
// Add empty line before first line and after last
["", ...result, ""].forEach(output => {
  console.log(output);
});
