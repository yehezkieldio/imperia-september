import { database, equal } from "@imperia/database";
import { guildSettings, guilds } from "@imperia/database/schema";
import { Utility } from "@imperia/stores";
import { UserError } from "@sapphire/framework";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

type SelectGuildSettings = typeof guildSettings.$inferSelect;
export type GuildSettings = Omit<SelectGuildSettings, "id">;

export class GuildUtility extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "guild",
        });
    }

    public async create(guildId: string): Promise<void> {
        await database.transaction(async (tx) => {
            await tx.insert(guilds).values({
                discordId: guildId,
            });

            await tx.insert(guildSettings).values({
                guildId,
            });
        });
    }

    public async delete(guildId: string): Promise<void> {
        await database.transaction(async (tx) => {
            await tx.delete(guilds).where(equal(guilds.discordId, guildId));
            await tx.delete(guildSettings).where(equal(guildSettings.guildId, guildId));
        });
    }

    public async exists(guildId: string): Promise<boolean> {
        const guild = await database.select().from(guilds).where(equal(guilds.discordId, guildId));

        return guild.length > 0;
    }

    /* -------------------------------------------------------------------------- */

    public async getSettings(guildId: string): Promise<GuildSettings> {
        const [settings] = await database.select().from(guildSettings).where(equal(guildSettings.guildId, guildId));

        if (!settings) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "Failed to get guild settings.",
            });
        }

        return settings;
    }

    /* -------------------------------------------------------------------------- */

    public async getPrefix(guildId: string): Promise<string> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (!settings.prefix) {
            return (
                typeof this.container.client.options.defaultPrefix === "string"
                    ? this.container.client.options.defaultPrefix
                    : "imperia!"
            ) as string;
        }

        return settings.prefix;
    }

    public async setPrefix(guildId: string, prefix: string): Promise<void> {
        await database.update(guildSettings).set({ prefix }).where(equal(guildSettings.guildId, guildId));
    }

    /* -------------------------------------------------------------------------- */

    public async getLanguage(guildId: string): Promise<string> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (!settings.language) {
            return "en-US";
        }

        return settings.language;
    }

    public async setLanguage(guildId: string, language: string): Promise<void> {
        await database.update(guildSettings).set({ language }).where(equal(guildSettings.guildId, guildId));
    }

    /* -------------------------------------------------------------------------- */

    public async getDisabledCommands(guildId: string): Promise<string[]> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (!settings.disabledCommands) {
            return [];
        }

        return settings.disabledCommands;
    }
}
