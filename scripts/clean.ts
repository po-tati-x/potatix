import { readdirSync, rmSync, statSync } from "fs";
import { join } from "path";

/**
 * Recursively delete build artefacts across the repo.
 * Targets: dist, .cache, node_modules, .turbo
 * Skips .git directory for safety.
 */
const TARGET_DIRS = new Set(["dist", "node_modules", ".turbo"]);

function purge(dir: string): void {
  for (const entry of readdirSync(dir)) {
    if (entry === ".git") continue; // keep git history

    const absolute = join(dir, entry);
    const stats = statSync(absolute);

    if (!stats.isDirectory()) continue;

    if (TARGET_DIRS.has(entry)) {
      rmSync(absolute, { recursive: true, force: true });
      console.log("🗑  Removed", absolute);
      continue;
    }

    purge(absolute);
  }
}

purge(process.cwd()); 