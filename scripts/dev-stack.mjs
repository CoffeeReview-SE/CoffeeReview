import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");

function readEnvFile(file) {
  const values = {};
  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

if (!existsSync(envFile)) {
  console.error("Missing .env. Copy .env.example to .env and set ConnectionStrings__Supabase and Gateway__SharedKey first.");
  process.exit(1);
}

const env = { ...readEnvFile(envFile), ...process.env };
const connectionString = env.ConnectionStrings__Supabase ?? "";
const gatewayKey = env.Gateway__SharedKey ?? "";
if (!connectionString || /YOUR_HOST|YOUR_PASSWORD/i.test(connectionString) || !gatewayKey || gatewayKey === "change-me-long-random") {
  console.error("Configure a real ConnectionStrings__Supabase and a private Gateway__SharedKey in .env before starting the backend.");
  process.exit(1);
}

const services = [
  {
    name: "catalog :5101",
    command: "dotnet",
    args: ["run", "--no-launch-profile", "--project", "services/catalog/src/SGCoffee.Catalog/SGCoffee.Catalog.csproj"],
  },
  {
    name: "localization :5102",
    command: "dotnet",
    args: ["run", "--no-launch-profile", "--project", "services/localization/SGCoffee.Localization.csproj"],
  },
  {
    name: "gateway :5100",
    command: "dotnet",
    args: ["run", "--no-launch-profile", "--project", "services/gateway/src/SGCoffee.Gateway/SGCoffee.Gateway.csproj"],
  },
  {
    name: "Vite :8080",
    command: process.execPath,
    args: [path.join(root, "node_modules/vite/bin/vite.js"), "--host", "localhost", "--port", "8080"],
  },
];

let shuttingDown = false;
const children = [];

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
  if (children.every(child => child.exitCode !== null || child.killed)) process.exit(exitCode);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

for (const service of services) {
  console.log(`Starting ${service.name}`);
  const child = spawn(service.command, service.args, { cwd: root, env, stdio: "inherit", shell: process.platform === "win32" && service.command === "dotnet" });
  children.push(child);
  child.on("error", error => {
    console.error(`${service.name} failed to start: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", code => {
    if (!shuttingDown) {
      console.error(`${service.name} stopped${code === 0 ? "." : ` with exit code ${code}.`}`);
      stopAll(code || 1);
    }
  });
}

console.log("Open http://localhost:8080 after the services report that they are listening.");
