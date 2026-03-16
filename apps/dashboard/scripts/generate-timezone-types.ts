import { timeZonesNames } from "@vvo/tzdb";
import { writeFileSync } from "fs";
import { join } from "path";

const union = timeZonesNames.map((n) => `  | "${n}"`).join("\n");
const out = `// Auto-generated from @vvo/tzdb – do not edit manually
// Run: bun run generate:timezone-types

export type TimeZone =
${union};
`;

const outPath = join(import.meta.dir, "../types/timezone.ts");
writeFileSync(outPath, out);
console.log(
  `✓ Generated ${timeZonesNames.length} timezones → types/timezone.ts`,
);
