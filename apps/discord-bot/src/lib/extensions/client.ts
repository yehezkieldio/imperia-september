import {} from "@imperia/database";
import { discordBotEnv } from "@imperia/environment/discord-bot";

import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import type { ClientOptions, CommandInteraction, Message } from "discord.js";

export interface ImperiaClientOptions extends SapphireClientOptions, ClientOptions {
    overrideApplicationCommandsRegistries?: boolean;
}

export class ImperiaClient extends SapphireClient {
    public constructor(options: ImperiaClientOptions) {
        super(options);

        container.logger.info(`ImperiaClient: Running on a ${discordBotEnv.NODE_ENV} environment.`);

        if (options.overrideApplicationCommandsRegistries === true) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }

    public override fetchPrefix = async (context: Message | CommandInteraction): Promise<string> => {
        const guildId: string = context.guildId ?? (context.guild?.id as string);

        return container.utilities.guild.getPrefix(guildId);
    };

    public override async login(token: string): Promise<string> {
        container.logger.info("ImperiaClient: Logging in...");
        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        return super.destroy();
    }
}
