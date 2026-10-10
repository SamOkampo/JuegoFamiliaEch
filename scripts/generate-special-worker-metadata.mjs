import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(readFileSync(resolve(root, "worker/src/special-content.json"), "utf8"));
const metadata = {
  version: source.version,
  cards: Object.fromEntries(
    Object.entries(source.cards).map(([kind, cards]) => [
      kind,
      cards.map(({ minAge, intensity, audiences, pack }) => ({
        minAge, intensity, audiences, pack,
      })),
    ]),
  ),
};
const output = "// GENERATED from worker/src/special-content.json — run node scripts/generate-special-worker-metadata.mjs\nexport default " +
  JSON.stringify(metadata) + ";\n";
const destination = resolve(root, "worker/src/special-metadata.mjs");
if (process.argv.includes("--check")) {
  if (readFileSync(destination, "utf8") !== output) {
    console.error("Special metadata is stale. Run node scripts/generate-special-worker-metadata.mjs");
    process.exitCode = 1;
  } else {
    console.log("Special metadata matches the 100-card catalog.");
  }
} else {
  writeFileSync(destination, output);
  console.log("Updated special metadata module.");
}
