import fs from "fs/promises";
import path from "path";
import { createApp } from "./app";
import { env } from "./config/env";

async function main() {
  await fs.mkdir(env.assetsRoot, { recursive: true });
  await fs.mkdir(path.join(env.assetsRoot, ".tmp"), { recursive: true });

  const app = createApp();
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[backend] failed to start", err);
  process.exit(1);
});

