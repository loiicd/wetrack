import { resolve } from "path";
import type { Stack } from "dashboard_as_code";

export interface DeployOptions {
  url: string;
  dryRun: boolean;
  verbose: boolean;
}

export async function deployCommand(
  filePath: string,
  options: DeployOptions,
): Promise<void> {
  const absolutePath = resolve(process.cwd(), filePath);

  // Dynamischer Import – Bun verarbeitet TypeScript nativ
  let mod: { default?: Stack };
  try {
    mod = await import(`file://${absolutePath}`);
  } catch (err) {
    console.error(`❌  Fehler beim Laden von "${filePath}":`);
    console.error(`   ${(err as Error).message}`);
    process.exit(1);
  }

  const stack = mod.default;

  if (
    !stack ||
    typeof stack !== "object" ||
    typeof (stack as Stack).synthesize !== "function"
  ) {
    console.error(`❌  "${filePath}" hat keinen gültigen default-Export.`);
    console.error(`   Erwartet: export default new Stack(...)`);
    process.exit(1);
  }

  const typedStack = stack as Stack;
  const payload = typedStack.synthesize();

  console.log(
    `✅  Stack "${payload.key}" (${payload.environment}) synthetisiert`,
  );
  console.log(`   Dashboards  : ${payload.dashboards?.length ?? 0}`);
  console.log(`   DataSources : ${payload.dataSources?.length ?? 0}`);
  console.log(`   Queries     : ${payload.queries?.length ?? 0}`);
  console.log(`   Charts      : ${payload.charts?.length ?? 0}`);
  console.log(`   Transforms  : ${payload.transforms?.length ?? 0}`);

  if (options.dryRun) {
    console.log("\n⚠️  Dry-run aktiv – kein Deployment durchgeführt.");
    if (options.verbose) {
      console.log("\nPayload:");
      console.log(JSON.stringify(payload, null, 2));
    }
    return;
  }

  console.log(`\n🚀  Deploying nach ${options.url} …`);

  const { status, body } = await typedStack.deploy(options.url);

  if (status >= 200 && status < 300) {
    console.log(`✅  Deployment erfolgreich (HTTP ${status})`);
    if (options.verbose && body) {
      console.log("Response:", body);
    }
  } else {
    console.error(`❌  Deployment fehlgeschlagen (HTTP ${status})`);
    if (body) console.error("Response:", body);
    process.exit(1);
  }
}
