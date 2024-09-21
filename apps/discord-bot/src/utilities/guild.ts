import { database, equal } from "@imperia/database";
import { guildSettings, guilds } from "@imperia/database/schema";
import { discordBotEnv } from "@imperia/environment/discord-bot";
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

    public async create(guildId: string): Promise<boolean> {
        try {
            await database.transaction(async (tx) => {
                await tx.insert(guilds).values({
                    discordId: guildId,
                });

                await tx.insert(guildSettings).values({
                    guildId,
                });
            });

            return true;
        } catch (e) {
            return false;
        }
    }

    public async delete(guildId: string): Promise<boolean> {
        try {
            await database.transaction(async (tx) => {
                await tx.delete(guilds).where(equal(guilds.discordId, guildId));
                await tx.delete(guildSettings).where(equal(guildSettings.guildId, guildId));
            });

            return true;
        } catch (e) {
            return false;
        }
    }

    public async exists(guildId: string): Promise<boolean> {
        try {
            const guild = await database.select().from(guilds).where(equal(guilds.discordId, guildId));

            return guild.length > 0;
        } catch (e) {
            return false;
        }
    }

    /* -------------------------------------------------------------------------- */

    public async getSettings(guildId: string): Promise<GuildSettings> {
        const [settings] = await database.select().from(guildSettings).where(equal(guildSettings.guildId, guildId));

        if (!settings) {
            await this.create(guildId);

            throw new UserError({
                identifier: ImperiaIdentifiers.UtilitiesError,
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
                    : discordBotEnv.DEFAULT_PREFIX
            ) as string;
        }

        return settings.prefix;
    }

    public async setPrefix(guildId: string, prefix: string): Promise<void> {
        await database.update(guildSettings).set({ prefix }).where(equal(guildSettings.guildId, guildId));
    }

    public async resetPrefix(guildId: string): Promise<void> {
        await this.setPrefix(guildId, discordBotEnv.DEFAULT_PREFIX);
    }

    /* -------------------------------------------------------------------------- */

    public async getLanguage(guildId: string): Promise<string> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (!settings.language) {
            return discordBotEnv.DEFAULT_LANGUAGE;
        }

        return settings.language;
    }

    public async setLanguage(guildId: string, language: string): Promise<void> {
        await database.update(guildSettings).set({ language }).where(equal(guildSettings.guildId, guildId));
    }

    public async resetLanguage(guildId: string): Promise<void> {
        await this.setLanguage(guildId, discordBotEnv.DEFAULT_LANGUAGE);
    }

    /* -------------------------------------------------------------------------- */

    public async getDisabledCommands(guildId: string): Promise<string[]> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (!settings.disabledCommands) {
            return [];
        }

        return settings.disabledCommands;
    }

    public async isCommandDisabled(guildId: string, commandName: string): Promise<boolean> {
        const settings: GuildSettings = await this.getSettings(guildId);

        return settings.disabledCommands.includes(commandName);
    }

    public async setDisabledCommand(guildId: string, commandName: string): Promise<void> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (settings.disabledCommands.includes(commandName)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.UtilitiesError,
                message: "Command is already disabled.",
            });
        }

        await database
            .update(guildSettings)
            .set({ disabledCommands: [...settings.disabledCommands, commandName] })
            .where(equal(guildSettings.guildId, guildId));
    }

    public async removeDisabledCommand(guildId: string, commandName: string): Promise<void> {
        const settings: GuildSettings = await this.getSettings(guildId);

        if (!settings.disabledCommands.includes(commandName)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.UtilitiesError,
                message: "Command is not disabled.",
            });
        }

        await database
            .update(guildSettings)
            .set({ disabledCommands: settings.disabledCommands.filter((name) => name !== commandName) })
            .where(equal(guildSettings.guildId, guildId));
    }

    public async resetDisabledCommands(guildId: string): Promise<void> {
        await database.update(guildSettings).set({ disabledCommands: [] }).where(equal(guildSettings.guildId, guildId));
    }
}
