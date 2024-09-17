import { ImperiaEvents } from "#lib/extensions/constants/events";

import { Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

export class GuildCreateListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.GuildCreate,
        });
    }

    public async run(guild: Guild): Promise<void> {
        if (!guild.available) return;
        this.container.logger.info(`GuildCreateListener: Joined guild ${guild.name} (${guild.id})`);

        await this.createGuildSettings(guild.id);
    }

    private async createGuildSettings(guildId: string): Promise<void> {
        const guild: boolean = await this.container.utilities.guild.exists(guildId);

        if (!guild) {
            this.container.logger.info(`GuildCreateListener: Creating settings for guild ${guildId}`);

            await this.container.utilities.guild.create(guildId);

            this.container.logger.info(`GuildCreateListener: Created settings for guild ${guildId}`);

            return;
        }

        this.container.logger.info(`GuildCreateListener: Settings already exist for guild ${guildId}`);
    }
}
