import { mkdirSync, cpSync, rmSync } from "fs";
import { join } from "path";

const outDir = "dist/ptune-log";
rmSync("dist", { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const file of ["main.js", "manifest.json", "styles.css"]) {
  cpSync(file, join(outDir, file));
}
console.log("Prepared dist folder:", outDir);
