process.env = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? "development",
};

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const sharedEnv = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        DATABASE_URL: z.string().url(),
    },
    clientPrefix: "PUBLIC_",
    client: {},
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    skipValidation: process.env.NODE_ENV === "test",
});

export const isProduction: boolean = process.env.NODE_ENV === "production";
