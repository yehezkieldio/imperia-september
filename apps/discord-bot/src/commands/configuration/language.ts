import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    UserError,
} from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

import { resolveKey } from "@sapphire/plugin-i18next";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { languageCodes, mapToLanguageArray } from "#lib/resolvers/language-code";

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
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        /* -------------------------------------------------------------------------- */

        const languageCode: string = interaction.options.getString("language_code", true);
        const currentLanguage: string = await this.container.utilities.guild.getLanguage(interaction.guild.id);

        if (currentLanguage === languageCode) {
            return interaction.reply({
                content: await resolveKey(interaction, "language:already_set", {
                    language: languageCode,
                }),
            });
        }

        await this.container.utilities.guild.setLanguage(interaction.guild.id, languageCode);

        return interaction.reply({
            content: await resolveKey(interaction, "language:set", {
                language: languageCode,
            }),
        });
    }

    public async messageRun(message: Message, args: Args) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        /* -------------------------------------------------------------------------- */

        const languageCodeArgument: ResultType<string> = await args.pickResult("languageCode");

        if (languageCodeArgument.isErr()) {
            const error: UserError | ArgumentError<string> = languageCodeArgument.unwrapErr();

            // If the argument provided is invalid, we'll throw an error.
            if (error.identifier === ImperiaIdentifiers.CommandServiceError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.ArgsMissing,
                    message: await resolveKey(message, "language:invalid_language", {
                        languages: error.message,
                    }),
                });
            }

            // If the argument provided is missing, we'll throw an error.
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "language:no_language", {
                    languages: languageCodes,
                }),
            });
        }

        /* -------------------------------------------------------------------------- */

        const currentLanguage: string = await this.container.utilities.guild.getLanguage(message.guild.id);
        const languageCode = languageCodeArgument.unwrap();

        if (currentLanguage === languageCode) {
            return message.reply({
                content: await resolveKey(message, "language:already_set", {
                    language: languageCode,
                }),
            });
        }

        await this.container.utilities.guild.setLanguage(message.guild.id, languageCode);

        return message.reply({
            content: await resolveKey(message, "language:set", {
                language: languageCode,
            }),
        });
    }
}
