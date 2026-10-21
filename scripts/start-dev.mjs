import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const backendEnv = resolve(root, "backend/.env");
const configuredPort = existsSync(backendEnv)
  ? readFileSync(backendEnv, "utf8").match(/^PORT\s*=\s*(\d+)/m)?.[1]
  : undefined;
const backendUrl = `http://127.0.0.1:${process.env.PORT || configuredPort || "3333"}`;
const expoCli = resolve(root, "node_modules/expo/bin/cli");
const args = process.argv.slice(2);
const children = new Set();
let shuttingDown = false;

function startProcess(command, commandArgs, name) {
  const child = spawn(command, commandArgs, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });
  children.add(child);
  child.once("error", (error) => {
    console.error(`${name} could not start: ${error.message}`);
    shutdown(1);
  });
  child.once("exit", (code, signal) => {
    children.delete(child);
    if (!shuttingDown) {
      console.error(`${name} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}.`);
      shutdown(code || 1);
    }
  });
  return child;
}

async function readHealth() {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function waitForDatabase(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (shuttingDown) throw new Error("Startup cancelled.");
    const health = await readHealth();
    if (health?.databaseConnected) return;
    await delay(1000);
  }
  throw new Error(
    `Backend did not connect to SQL Server at ${backendUrl} within ${timeoutMs / 1000}s. ` +
      "Check that SQL Server (SQLEXPRESS) is running, backend/.env has the correct DB settings, " +
      "and start this command from the Windows account allowed to use Windows Authentication.",
  );
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
  setTimeout(() => process.exit(code), 100).unref();
}

process.once("SIGINT", () => shutdown(0));
process.once("SIGTERM", () => shutdown(0));

try {
  if (!existsSync(backendEnv)) {
    throw new Error("backend/.env is missing. Copy backend/.env.example to backend/.env and configure SQL Server.");
  }
  if (!existsSync(expoCli)) throw new Error("Expo CLI is missing. Run npm install first.");

  let health = await readHealth();
  let backendProcess;
  if (health?.databaseConnected) {
    console.log("Backend and SQL Server are already connected; reusing the running backend.");
  } else {
    if (health) {
      throw new Error(
        `A backend is already listening at ${backendUrl}, but its database connection is down. ` +
          "Stop that backend, check SQL Server and backend/.env, then run npm start again.",
      );
    }

    console.log("Starting backend and checking its SQL Server connection...");
    backendProcess = startProcess(
      process.execPath,
      [`--env-file=${backendEnv}`, "backend/server.mjs"],
      "Backend",
    );
    await waitForDatabase();
    if (backendProcess.exitCode !== null) throw new Error("Backend stopped during startup.");
  }

  console.log("Backend database is ready. Starting Expo...");
  if (!args.some((arg) => arg === "--port" || arg.startsWith("--port="))) {
    args.push("--port", "0");
  }
  startProcess(process.execPath, [expoCli, "start", ...args], "Expo");
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  shutdown(1);
}
