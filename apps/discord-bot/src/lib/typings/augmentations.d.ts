import type { Guild } from "discord.js";

import type { ResponseService } from "#services/response";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
    }

    interface Container {
        services: Services;
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        guild: Guild;
    }

    interface Preconditions {}
}
