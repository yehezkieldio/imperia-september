import type { Guild } from "discord.js";

import type { BlacklistService } from "#services/blacklist";
import type { ResponseService } from "#services/response";

import type { ImperiaCommand } from "#lib/extensions/command";
import type { BotUtility } from "#utilities/bot";
import type { GuildUtility } from "#utilities/guild";
import type { UserUtility } from "#utilities/user";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
        blacklist: BlacklistService;
    }

    interface Utilities {
        bot: BotUtility;
        guild: GuildUtility;
        user: UserUtility;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        guild: Guild;
        command: ImperiaCommand;
        languageCode: string;
        timeExpression: number;
    }

    interface Preconditions {
        DeveloperUserOnly: never;
    }
}
