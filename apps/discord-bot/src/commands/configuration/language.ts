import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    UserError,
} from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { type Message, PermissionFlagsBits } from "discord.js";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaEmbedBuilder } from "#lib/extensions/embed-builder";
import { ImperiaSubcommand } from "#lib/extensions/subcommand";
import { languageCodes, mapToLanguageArray } from "#lib/resolvers/language-code";

export class LanguageCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.LoaderContext, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage how the bot speaks in your server.",
            preconditions: [ImperiaIdentifiers.DeveloperUserOnly],
            requiredUserPermissions: [PermissionFlagsBits.ManageGuild],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            subcommands: [
                {
                    type: "method",
                    name: "list",
                    default: true,
                    messageRun: "messageList",
                    chatInputRun: "chatInputList",
                },
                {
                    name: "action",
                    type: "group",
                    entries: [
                        { type: "method", name: "set", chatInputRun: "chatInputSet", messageRun: "messageSet" },
                        {
                            type: "method",
                            name: "reset",
                            chatInputRun: "chatInputReset",
                            messageRun: "messageReset",
                        },
                    ],
                },
            ],
        });
    }

    public override registerApplicationCommands(registry: ImperiaSubcommand.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) => command.setName("list").setDescription("List all available languages"))
                .addSubcommandGroup((group) =>
                    group
                        .setName("action")
                        .setDescription("Manage language settings")
                        .addSubcommand((command) =>
                            command
                                .setName("set")
                                .setDescription("Set the bot's language")
                                .addStringOption((option) =>
                                    option
                                        .setName("language_code")
                                        .setDescription("The language code to set the bot's language to")
                                        .setRequired(true)
                                        .addChoices(mapToLanguageArray()),
                                ),
                        )
                        .addSubcommand((command) =>
                            command.setName("reset").setDescription("Reset the bot's language"),
                        ),
                ),
        );
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const languageList: string = this.#getLanguageList();
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(interaction, "language:list_languages", { languages: languageList }));

        return interaction.reply({ embeds: [embed] });
    }

    public async messageList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const languageList: string = this.#getLanguageList();
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(message, "language:list_languages", { languages: languageList }));

        return message.reply({ embeds: [embed] });
    }

    #getLanguageList() {
        return mapToLanguageArray()
            .map((lang) => `${lang.name} - ${lang.value}`)
            .join("\n");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

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

    public async messageSet(message: Message, args: Args) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

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

    /* -------------------------------------------------------------------------- */

    public async chatInputReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetLanguage(interaction.guild.id);

        return interaction.reply({
            content: await resolveKey(interaction, "language:reset"),
        });
    }

    public async messageReset(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetLanguage(message.guild.id);

        return message.reply({
            content: await resolveKey(message, "language:reset"),
        });
    }
}
