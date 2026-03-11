import fs from "fs";
import path from "path";

function readJson(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function bumpVersionString(version) {
  if (!version || typeof version !== "string") {
    return "0.0.1";
  }
  const parts = version.split(".").map((p) => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join(".");
}

function main() {
  const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

  const manifestPath = path.join(rootDir, "extension", "manifest.json");
  const pkgPath = path.join(rootDir, "package.json");

  const manifest = readJson(manifestPath);
  const pkg = readJson(pkgPath);

  const currentVersion = manifest.version || pkg.version || "0.0.0";
  const nextVersion = bumpVersionString(currentVersion);

  manifest.version = nextVersion;
  pkg.version = nextVersion;

  writeJson(manifestPath, manifest);
  writeJson(pkgPath, pkg);

  // eslint-disable-next-line no-console
  console.log(`Bumped version to ${nextVersion}`);
}

main();

