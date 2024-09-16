import { sharedEnv } from "@imperia/environment/shared";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: sharedEnv.DATABASE_URL,
    },
    tablesFilter: ["imperia_*"],
    out: "./migrations",
} satisfies Config;
