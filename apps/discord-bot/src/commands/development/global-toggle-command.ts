import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

import { DEVELOPMENT_SERVERS } from "#lib/configuration";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { resolveCommand } from "#lib/resolvers/command";

export class GlobalToggleCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Globally toggle a command enabled or disabled, will reset after a bot restart.",
            preconditions: [ImperiaIdentifiers.DeveloperUserOnly],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("command").setDescription("The command to toggle.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: DEVELOPMENT_SERVERS,
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const commandArgument = interaction.options.getString("command", true);

        const getCommand = resolveCommand(commandArgument);
        if (getCommand.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgumentCommandError,
            });
        }

        const command = getCommand.unwrap();

        if (command.enabled === false) {
            command.enabled = true;

            return interaction.reply(`Enabled the command \`${command.name}\`.`);
        }

        command.enabled = false;

        return interaction.reply(`Disabled the command \`${command.name}\`.`);
    }

    public async messageRun(message: Message, args: Args) {
        const commandArgument: ResultType<ImperiaCommand> = await args.restResult("command");
        if (commandArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgumentCommandError,
            });
        }

        const command = commandArgument.unwrap();

        if (command.enabled === false) {
            command.enabled = true;

            return message.reply(`Enabled the command \`${command.name}\`.`);
        }

        command.enabled = false;

        return message.reply(`Disabled the command \`${command.name}\`.`);
    }
}
