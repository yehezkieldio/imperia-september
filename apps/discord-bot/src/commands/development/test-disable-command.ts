import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

import { DEVELOPMENT_SERVERS } from "#lib/configuration";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class TestDisableCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Simulate a globally disabled command.",
            preconditions: [ImperiaIdentifiers.DeveloperUserOnly],
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
        });
    }

    public async messageRun(message: Message) {
        throw new UserError({
            identifier: ImperiaIdentifiers.CommandDisabled,
        });
    }
}
