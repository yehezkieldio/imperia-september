import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    UserError,
} from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { type Message, PermissionFlagsBits } from "discord.js";
import type { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaEmbedBuilder } from "#lib/extensions/embed-builder";
import { ImperiaSubcommand } from "#lib/extensions/subcommand";
import { resolveCommand } from "#lib/resolvers/command";
import { languageCodes, mapToLanguageArray } from "#lib/resolvers/language-code";

export class GuildConfigurationCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.LoaderContext, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage the bot's configuration for this server.",
            tags: ["guild"],
            requiredUserPermissions: [PermissionFlagsBits.ManageGuild],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            name: "guildconfig",
            subcommands: [
                {
                    name: "default",
                    type: "method",
                    default: true,
                    messageRun: "messageDefault",
                },
                {
                    name: "command",
                    type: "group",
                    entries: [
                        { name: "list", messageRun: "messageCommandList", chatInputRun: "chatInputCommandList" },
                        { name: "enable", messageRun: "messageCommandEnable", chatInputRun: "chatInputCommandEnable" },
                        {
                            name: "disable",
                            messageRun: "messageCommandDisable",
                            chatInputRun: "chatInputCommandDisable",
                        },
                    ],
                },
                {
                    name: "prefix",
                    type: "group",
                    entries: [
                        { name: "list", messageRun: "messagePrefixList", chatInputRun: "chatInputPrefixList" },
                        { name: "set", messageRun: "messagePrefixSet", chatInputRun: "chatInputPrefixSet" },
                        { name: "reset", messageRun: "messagePrefixReset", chatInputRun: "chatInputPrefixReset" },
                    ],
                },
                {
                    name: "language",
                    type: "group",
                    entries: [
                        { name: "list", messageRun: "messageLanguageList", chatInputRun: "chatInputLanguageList" },
                        { name: "set", messageRun: "messageLanguageSet", chatInputRun: "chatInputLanguageSet" },
                        { name: "reset", messageRun: "messageLanguageReset", chatInputRun: "chatInputLanguageReset" },
                    ],
                },
                {
                    name: "reset",
                    type: "method",
                    messageRun: "messageReset",
                    chatInputRun: "chatInputReset",
                },
            ],
        });
    }

    public override registerApplicationCommands(registry: ImperiaSubcommand.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommandGroup((group) =>
                    group
                        .setName("command")
                        .setDescription("Manage the commands availability in this server.")
                        .addSubcommand((command) =>
                            command.setName("list").setDescription("List any disabled commands in this server."),
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("enable")
                                .setDescription("Enable a command in this server.")
                                .addStringOption((option) =>
                                    option
                                        .setName("command")
                                        .setDescription("The command to enable.")
                                        .setRequired(true),
                                ),
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("disable")
                                .setDescription("Disable a command in this server.")
                                .addStringOption((option) =>
                                    option
                                        .setName("command")
                                        .setDescription("The command to disable.")
                                        .setRequired(true),
                                ),
                        ),
                )
                .addSubcommandGroup((group) =>
                    group
                        .setName("prefix")
                        .setDescription("Manage the bot's prefix in this server.")
                        .addSubcommand((command) =>
                            command.setName("list").setDescription("List all prefixes in this server."),
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("set")
                                .setDescription("Set a new prefix for this server.")
                                .addStringOption((option) =>
                                    option.setName("prefix").setDescription("The new prefix to set.").setRequired(true),
                                ),
                        )
                        .addSubcommand((command) =>
                            command.setName("reset").setDescription("Reset the prefix to the default prefix."),
                        ),
                )
                .addSubcommandGroup((group) =>
                    group
                        .setName("language")
                        .setDescription("Manage how the bot speaks in this server.")
                        .addSubcommand((command) =>
                            command.setName("list").setDescription("List all available languages"),
                        )
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
                )
                .addSubcommand((command) =>
                    command.setName("reset").setDescription("Reset the bot's configuration for this server."),
                ),
        );
    }

    /* -------------------------------------------------------------------------- */

    public async messageDefault(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const prefix: string = await this.container.utilities.guild.getPrefix(message.guild.id);

        const embed = new ImperiaEmbedBuilder().setTheme("info");
        embed.setDescription(
            await resolveKey(message, "guildconfig:default", {
                prefix: prefix,
            }),
        );

        return message.reply({ embeds: [embed] });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputCommandList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const disabledCommands: string[] = await this.#getDisabledCommands(interaction.guild.id);

        const embed = new ImperiaEmbedBuilder().setTheme("info");
        embed.setDescription(
            await resolveKey(interaction, "guildconfig:list_disabled_commands", {
                commands: disabledCommands.join(", "),
            }),
        );

        return interaction.reply({ embeds: [embed] });
    }

    public async messageCommandList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const disabledCommands: string[] = await this.#getDisabledCommands(message.guild.id);

        const embed = new ImperiaEmbedBuilder().setTheme("info");
        embed.setDescription(
            await resolveKey(
                message,
                disabledCommands.length > 0 ? "guildconfig:list_disabled_commands" : "guildconfig:no_disabled_commands",
                {
                    commands: disabledCommands.join(", "),
                },
            ),
        );

        return message.reply({ embeds: [embed] });
    }

    #getDisabledCommands(guildId: string): Promise<string[]> {
        return this.container.utilities.guild.getDisabledCommands(guildId);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputCommandEnable(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const command = interaction.options.getString("command", true);

        const isValidCommand = resolveCommand(command);
        if (isValidCommand.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "guildconfig:invalid_command"),
            });
        }

        const isDisabled = await this.container.utilities.guild.isCommandDisabled(interaction.guild.id, command);
        if (!isDisabled) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "guildconfig:already_enabled", { command }),
            });
        }

        await this.container.utilities.guild.removeDisabledCommand(interaction.guild.id, command);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:enabled", { command: command }),
        });
    }

    public async messageCommandEnable(message: Message, args: Args) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const commandArgument: ResultType<ImperiaCommand> = await args.pickResult("command");

        if (commandArgument.isErr()) {
            const error: UserError | ArgumentError<string> = commandArgument.unwrapErr();

            // If the argument provided is invalid, we'll throw an error.
            if (error.identifier === ImperiaIdentifiers.ArgumentCommandError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: await resolveKey(message, "language:invalid_command"),
                });
            }

            // If the argument provided is missing, we'll throw an error.
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "language:no_command"),
            });
        }

        const command = commandArgument.unwrap();

        const isDisabled = await this.container.utilities.guild.isCommandDisabled(message.guild.id, command.name);
        if (!isDisabled) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "guildconfig:already_enabled", { command: command.name }),
            });
        }

        await this.container.utilities.guild.removeDisabledCommand(message.guild.id, command.name);

        return message.reply({
            content: await resolveKey(message, "guildconfig:enabled", { command: command.name }),
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputCommandDisable(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const command = interaction.options.getString("command", true);

        const isValidCommand = resolveCommand(command);
        if (isValidCommand.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "guildconfig:invalid_command"),
            });
        }

        if (command === "guildconfig") {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "guildconfig:cannot_disable_guildconfig"),
            });
        }

        const isDisabled = await this.container.utilities.guild.isCommandDisabled(interaction.guild.id, command);
        if (isDisabled) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "guildconfig:already_disabled", { command }),
            });
        }

        await this.container.utilities.guild.setDisabledCommand(interaction.guild.id, command);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:disabled", { command: command }),
        });
    }

    public async messageCommandDisable(message: Message, args: Args) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const commandArgument: ResultType<ImperiaCommand> = await args.pickResult("command");

        if (commandArgument.isErr()) {
            const error: UserError | ArgumentError<string> = commandArgument.unwrapErr();

            // If the argument provided is invalid, we'll throw an error.
            if (error.identifier === ImperiaIdentifiers.ArgumentCommandError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: await resolveKey(message, "language:invalid_command"),
                });
            }

            // If the argument provided is missing, we'll throw an error.
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "language:no_command"),
            });
        }

        const command = commandArgument.unwrap();

        if (command.name === "guildconfig") {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "guildconfig:cannot_disable_guildconfig"),
            });
        }

        const isDisabled = await this.container.utilities.guild.isCommandDisabled(message.guild.id, command.name);
        if (isDisabled) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "guildconfig:already_disabled", { command: command.name }),
            });
        }

        await this.container.utilities.guild.setDisabledCommand(message.guild.id, command.name);

        return message.reply({
            content: await resolveKey(message, "guildconfig:disabled", { command: command.name }),
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputPrefixList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const prefix: string = await this.container.utilities.guild.getPrefix(interaction.guild.id);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(interaction, "guildconfig:list_prefix", { prefix: prefix }));

        return interaction.reply({ embeds: [embed] });
    }

    public async messagePrefixList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const prefix: string = await this.container.utilities.guild.getPrefix(message.guild.id);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(message, "guildconfig:list_prefix", { prefix: prefix }));

        return message.reply({ embeds: [embed] });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputPrefixSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const prefix = interaction.options.getString("prefix", true);
        const currentPrefix = await this.container.utilities.guild.getPrefix(interaction.guild.id);

        if (currentPrefix === prefix) {
            return interaction.reply({
                content: await resolveKey(interaction, "guildconfig:already_set_prefix", {
                    prefix: prefix,
                }),
            });
        }

        await this.container.utilities.guild.setPrefix(interaction.guild.id, prefix);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:set_prefix", {
                prefix: prefix,
            }),
        });
    }

    public async messagePrefixSet(message: Message, args: Args) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const prefixArgument: ResultType<string> = await args.pickResult("string");

        if (prefixArgument.isErr()) {
            const error: UserError | ArgumentError<string> = prefixArgument.unwrapErr();

            // If the argument provided is invalid, we'll throw an error.
            if (error.identifier === ImperiaIdentifiers.CommandServiceError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.ArgsMissing,
                    message: await resolveKey(message, "guildconfig:invalid_prefix"),
                });
            }

            // If the argument provided is missing, we'll throw an error.
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "guildconfig:no_prefix"),
            });
        }

        const prefix = prefixArgument.unwrap();
        const currentPrefix = await this.container.utilities.guild.getPrefix(message.guild.id);

        if (currentPrefix === prefix) {
            return message.reply({
                content: await resolveKey(message, "guildconfig:already_set_prefix", {
                    prefix: prefix,
                }),
            });
        }

        await this.container.utilities.guild.setPrefix(message.guild.id, prefix);

        return message.reply({
            content: await resolveKey(message, "guildconfig:set_prefix", {
                prefix: prefix,
            }),
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputPrefixReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetPrefix(interaction.guild.id);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:reset_prefix"),
        });
    }

    public async messagePrefixReset(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetPrefix(message.guild.id);

        return message.reply({
            content: await resolveKey(message, "guildconfig:reset_prefix"),
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputLanguageList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const languageList: string = this.#getLanguageList();
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(interaction, "guildconfig:list_languages", { languages: languageList }));

        return interaction.reply({ embeds: [embed] });
    }

    public async messageLanguageList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const languageList: string = this.#getLanguageList();
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(message, "guildconfig:list_languages", { languages: languageList }));

        return message.reply({ embeds: [embed] });
    }

    #getLanguageList() {
        return mapToLanguageArray()
            .map((lang) => `${lang.name} - ${lang.value}`)
            .join("\n");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputLanguageSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
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
                content: await resolveKey(interaction, "guildconfig:already_set_language", {
                    language: languageCode,
                }),
            });
        }

        await this.container.utilities.guild.setLanguage(interaction.guild.id, languageCode);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:set_language", {
                language: languageCode,
            }),
        });
    }

    public async messageLanguageSet(message: Message, args: Args) {
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
                    message: await resolveKey(message, "guildconfig:invalid_language", {
                        languages: error.message,
                    }),
                });
            }

            // If the argument provided is missing, we'll throw an error.
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "guildconfig:no_language", {
                    languages: languageCodes,
                }),
            });
        }

        const currentLanguage: string = await this.container.utilities.guild.getLanguage(message.guild.id);
        const languageCode: string = languageCodeArgument.unwrap();

        if (currentLanguage === languageCode) {
            return message.reply({
                content: await resolveKey(message, "guildconfig:already_set_language", {
                    language: languageCode,
                }),
            });
        }

        await this.container.utilities.guild.setLanguage(message.guild.id, languageCode);

        return message.reply({
            content: await resolveKey(message, "guildconfig:set_language", {
                language: languageCode,
            }),
        });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputLanguageReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetLanguage(interaction.guild.id);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:reset_language"),
        });
    }

    public async messageLanguageReset(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetLanguage(message.guild.id);

        return message.reply({
            content: await resolveKey(message, "guildconfig:reset_language"),
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
        await this.container.utilities.guild.resetPrefix(interaction.guild.id);
        await this.container.utilities.guild.resetDisabledCommands(interaction.guild.id);

        return interaction.reply({
            content: await resolveKey(interaction, "guildconfig:reset"),
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
        await this.container.utilities.guild.resetPrefix(message.guild.id);
        await this.container.utilities.guild.resetDisabledCommands(message.guild.id);

        return message.reply({
            content: await resolveKey(message, "guildconfig:reset"),
        });
    }
}
