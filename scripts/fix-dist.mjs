import fs from "node:fs";
import path from "node:path";

const dist = "dist";
const vectorFonts = path.join(
  dist,
  "assets",
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts",
);
const publicFonts = path.join(dist, "assets", "icon-fonts");

if (fs.existsSync(vectorFonts)) {
  fs.mkdirSync(publicFonts, { recursive: true });
  for (const entry of fs.readdirSync(vectorFonts)) {
    if (entry.endsWith(".ttf")) {
      fs.copyFileSync(path.join(vectorFonts, entry), path.join(publicFonts, entry));
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(html|js|css|json|txt)$/.test(entry.name)) {
      const text = fs.readFileSync(p, "utf8");
      const rewritten = text.replace(
        /\/assets\/(?:node_modules|vendor)\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/([^"')?]+)/g,
        "/assets/icon-fonts/$1",
      );
      if (rewritten !== text) fs.writeFileSync(p, rewritten);
    }
  }
}
walk(dist);