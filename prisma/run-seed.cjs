const { spawnSync } = require("node:child_process");

const preload = "--require=./prisma/tsx-windows-preload.cjs";
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const env = {
  ...process.env,
  NODE_OPTIONS: existingNodeOptions
    ? `${existingNodeOptions} ${preload}`
    : preload,
};

const result = spawnSync(
  process.execPath,
  ["./node_modules/tsx/dist/cli.mjs", ...process.argv.slice(2)],
  { env, stdio: "inherit" },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
