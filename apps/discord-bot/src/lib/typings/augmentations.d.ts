import type { Guild } from "discord.js";

import type { BlacklistService } from "#services/blacklist";
import type { ResponseService } from "#services/response";

import type { BotUtility } from "#utilities/bot";
import type { GuildUtility } from "#utilities/guild";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
        blacklist: BlacklistService;
    }

    interface Utilities {
        bot: BotUtility;
        guild: GuildUtility;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        guild: Guild;
        languageCode: string;
        timeExpression: number;
    }

    interface Preconditions {
        DeveloperUserOnly: never;
    }
}
