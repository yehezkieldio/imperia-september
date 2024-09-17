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
            .addStringOption((option) => option.setChoices(mapToLanguageArray()));

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const languageCode = interaction.options.getString("languageCode", true);

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

        const languageCode = languageCodeArgument.unwrap();
        return message.reply(`Language set to ${languageCode}`);
    }
}
