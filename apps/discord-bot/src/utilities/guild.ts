import { database, equal } from "@imperia/database";
import { guildSettings } from "@imperia/database/schema";
import { Utility } from "@imperia/stores";

export class GuildUtility extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "guild",
        });
    }

    public async getPrefix(guildId: string): Promise<string> {
        const settings = await database.select().from(guildSettings).where(equal(guildSettings.guildId, guildId));

        if (settings.length === 0) {
            return "imperia!";
        }

        return settings[0]?.prefix ?? "imperia!";
    }

    public async getLanguage(guildId: string): Promise<string> {
        const settings = await database.select().from(guildSettings).where(equal(guildSettings.guildId, guildId));

        if (settings.length === 0) {
            return "en-US";
        }

        return settings[0]?.language ?? "en-US";
    }
}
