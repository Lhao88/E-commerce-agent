import { spawn } from "node:child_process";
import { createServer } from "vite";

process.env.VITE_API_MODE = "mock";
process.env.PLAYWRIGHT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5183";
const port = Number(new URL(process.env.PLAYWRIGHT_BASE_URL).port);

const server = await createServer({
  server: {
    host: "127.0.0.1",
    port,
    strictPort: true
  }
});

await server.listen();
server.printUrls();

let exitCode = 1;

try {
  const requestedTests = process.argv.slice(2);
  const command = [
    "npx playwright test",
    ...requestedTests,
    "--config=playwright.config.ts",
    "--reporter=line"
  ].join(" ");
  const child = spawn(command, {
    cwd: process.cwd(),
    env: process.env,
    shell: true,
    stdio: "inherit"
  });

  exitCode = await new Promise((resolve) => {
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
} finally {
  await server.close();
}

process.exit(exitCode);
