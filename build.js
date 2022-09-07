import { execSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";
import packageJson from "./package.json" assert { type: "json" };

rmSync("pkg/", { force: true, recursive: true });
execSync("npx tsc -p .", { stdio: "inherit" });
cpSync("LICENSE", "pkg/LICENSE");
cpSync("README.md", "pkg/README.md");
delete packageJson.prettier;
delete packageJson.private;
delete packageJson.scripts;
writeFileSync("pkg/package.json", JSON.stringify(packageJson, undefined, 2), "utf8");
