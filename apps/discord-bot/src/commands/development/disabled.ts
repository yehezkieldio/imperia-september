import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

import { DEVELOPMENT_SERVERS } from "#lib/configuration";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class DisabledCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "A disabled command, for testing purposes.",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            guildIds: DEVELOPMENT_SERVERS,
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        throw new UserError({
            identifier: ImperiaIdentifiers.CommandDisabled,
            message: "This command is disabled.",
        });
    }

    public async messageRun(message: Message) {
        throw new UserError({
            identifier: ImperiaIdentifiers.CommandDisabled,
            message: "This command is disabled.",
        });
    }
}
