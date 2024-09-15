import type { Guild } from "discord.js";

import type { ResponseService } from "#services/response";
import type { BotUtility } from "#utilities/bot";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
    }

    interface Utilities {
        bot: BotUtility;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        guild: Guild;
    }

    interface Preconditions {}
}
