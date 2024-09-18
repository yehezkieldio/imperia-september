import { connection, database } from "@imperia/database";
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

        // Verify if there is a connection and the tables are created in the database
        container.logger.info("ImperiaClient: Connected to the PostgreSQL database.");
        try {
            container.logger.info("ImperiaClient: Testing the PostgresQL database connection...");
            await database.query.users.findFirst();
            container.logger.info("ImperiaClient: PostgresQL database connection test successful.");
        } catch (error) {
            container.logger.error("ImperiaClient: An error occurred with the Postgres database, see below:");
            container.logger.error(error);

            process.exit(1);
        }
        container.logger.info("ImperiaClient: PostgresQL database is ready for use.");

        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        await connection.end({
            timeout: 3,
        });
        container.logger.info("ImperiaClient: Disconnected from the PostgresQL database.");

        return super.destroy();
    }
}
