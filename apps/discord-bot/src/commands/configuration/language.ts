import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { mapToLanguageArray } from "#lib/resolvers/language-code";

export class LanguageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Change the bot's language, for this server.",
            tags: ["preferences"],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("language_code")
                    .setDescription("The language code to set the bot to.")
                    .addChoices(mapToLanguageArray())
                    .setRequired(true),
            );

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const languageCode: string = interaction.options.getString("language_code", true);

        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be used in a server.",
            });
        }

        const currentLanguage: string = await this.container.utilities.guild.getLanguage(interaction.guild.id);

        if (currentLanguage === languageCode) {
            return interaction.reply(`Language already set to ${languageCode}`);
        }

        return interaction.reply(`Language set to ${languageCode}`);
    }

    public async messageRun(message: Message, args: Args) {
        const languageCodeArgument: ResultType<string> = await args.pickResult("languageCode");
        if (languageCodeArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "Invalid language provided.",
            });
        }

        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be used in a server.",
            });
        }

        const currentLanguage: string = await this.container.utilities.guild.getLanguage(message.guild.id);
        const languageCode = languageCodeArgument.unwrap();

        if (currentLanguage === languageCode) {
            return message.reply(`Language already set to ${languageCode}`);
        }

        return message.reply(`Language set to ${languageCode}`);
    }
}
