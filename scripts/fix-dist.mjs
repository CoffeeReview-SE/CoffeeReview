import fs from "node:fs";
import path from "node:path";

const dist = "dist";
const from = path.join(dist, "assets", "node_modules");
const to = path.join(dist, "assets", "vendor");
if (fs.existsSync(from)) fs.renameSync(from, to);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(html|js|css|json|txt)$/.test(entry.name)) {
      const text = fs.readFileSync(p, "utf8");
      if (text.includes("assets/node_modules"))
        fs.writeFileSync(p, text.replaceAll("assets/node_modules", "assets/vendor"));
    }
  }
}
walk(dist);