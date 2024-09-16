import "../../packages/environment/src/shared";

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
});
