import { readdir } from "node:fs/promises";
import path from "node:path";

import type { BuildOutput } from "bun";

const files: string[] = (await readdir(path.join(import.meta.dir, "../", "src"), { recursive: true }))
    .filter((file: string): boolean => file.endsWith(".ts"))
    .map((file: string): string => path.join("src", file));

const start: number = Date.now();

const result: BuildOutput = await Bun.build({
    entrypoints: files,
    outdir: "./dist",
    packages: "external",
    splitting: true,
    minify: true,
});

const end: number = Date.now();
const elapsed: number = end - start;

if (!result.success) {
    console.error`Build failed. Time elapsed: ${elapsed}ms`;

    for (const message of result.logs) {
        console.error(message);
    }
} else {
    console.log(`Build successful. Time elapsed: ${elapsed}ms`);
}
