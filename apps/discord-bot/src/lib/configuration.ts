import { database, equal } from "@imperia/database";
import { ImperiaLogger, LogLevel } from "@imperia/logger";

import { Time } from "@sapphire/time-utilities";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";

import { guildSettings } from "@imperia/database/schema";
import { discordBotEnv } from "@imperia/environment/discord-bot";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";
import type { ImperiaClientOptions } from "#lib/extensions/client";

export const DEVELOPERS: string[] = ["327849142774923266"];
export const DEVELOPMENT_SERVERS: string[] = ["1209737959587450980"];

export const configuration: ImperiaClientOptions = {
    allowedMentions: {
        parse: [],
        users: [],
        roles: [],
        repliedUser: true,
    },
    defaultCooldown: {
        delay: Time.Second * 2,
        filteredUsers: DEVELOPERS,
    },
    defaultPrefix: "imperia ",
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    i18n: {
        fetchLanguage: async (context: InternationalizationContext): Promise<string | null> => {
            if (!context.guild) return "en-US";

            const [settings] = await database
                .select()
                .from(guildSettings)
                .where(equal(guildSettings.guildId, context.guild.id));

            return settings?.language ?? "en-US";
        },
    },
    loadApplicationCommandRegistriesStatusListeners: discordBotEnv.NODE_ENV === "development",
    loadDefaultErrorListeners: discordBotEnv.NODE_ENV === "development",
    loadMessageCommandListeners: true,
    logger: {
        instance: new ImperiaLogger({
            withTimestamp: true,
            minLevel: discordBotEnv.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info,
        }),
        level: discordBotEnv.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info,
    },
    overrideApplicationCommandsRegistries: discordBotEnv.NODE_ENV === "development",
    partials: [Partials.Message, Partials.User, Partials.GuildMember],
    presence: {
        activities: [
            {
                type: ActivityType.Listening,
                name: "reality, the manifested. ✨",
            },
        ],
        status: "dnd",
    },
    typing: true,
};
