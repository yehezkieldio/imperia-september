import "../../packages/environment/src/shared";

import { ImperiaLogger } from "@imperia/logger";

import * as fs from "node:fs";
import * as path from "node:path";

const srcDir: string = path.join(__dirname, "src", "languages");
const destDir: string = path.join(__dirname, "dist", "languages");

const ensureDirExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const logger = new ImperiaLogger({
    withTimestamp: false,
});

import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.test.ts*"],
    clean: true,
    sourcemap: process.env.NODE_ENV !== "production",
    minify: true,
    skipNodeModulesBundle: true,
    keepNames: true,
    tsconfig: "tsconfig.json",
    noExternal: ["@imperia/environment", "@imperia/logger", "@imperia/database", "@imperia/stores"],
    async onSuccess() {
        const findJSONFiles = (dir: string): string[] => {
            let results: string[] = [];

            const list = fs.readdirSync(dir);

            for (const file of list) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    results = results.concat(findJSONFiles(fullPath));
                } else if (file.endsWith(".json")) {
                    results.push(fullPath);
                }
            }

            return results;
        };

        const copyFile = (src: string, dest: string) => {
            ensureDirExists(path.dirname(dest));
            fs.copyFileSync(src, dest);
        };

        const jsonFiles: string[] = findJSONFiles(srcDir);

        logger.build("Copying translation files...");
        for (const jsonFile of jsonFiles) {
            const relativePath = path.relative(srcDir, jsonFile);
            const destPath = path.join(destDir, relativePath);

            copyFile(jsonFile, destPath);

            logger.build(`${"dist/"}${destPath.split("dist/")[1]}`);
        }
    },
});
