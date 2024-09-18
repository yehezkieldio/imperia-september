import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { sharedEnv } from "./shared";

export const discordBotEnv = {
    ...sharedEnv,

    ...createEnv({
        server: {
            DISCORD_TOKEN: z.string(),
            DEFAULT_PREFIX: z.string().default("imperia!"),
            DEFAULT_LANGUAGE: z.string().default("en-US"),
        },
        runtimeEnv: process.env,
    }),
};
