import { readdir } from "node:fs/promises";
import path from "node:path";

import { ImperiaLogger } from "@imperia/logger";
import type { BuildOutput } from "bun";

const logger = new ImperiaLogger();

const files: string[] = (await readdir(path.join(import.meta.dir, "../", "src"), { recursive: true }))
    .filter((file: string): boolean => file.endsWith(".ts"))
    .map((file: string): string => path.join("src", file));

logger.info("Building...");

const result: BuildOutput = await Bun.build({
    entrypoints: files,
    outdir: "./dist",
    packages: "external",
    splitting: true,
    minify: true,
});

if (!result.success) {
    logger.error("Build failed!");

    for (const message of result.logs) {
        console.error(message);
    }
} else {
    logger.info("Build successful!");
}
