import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { type Message, PermissionFlagsBits } from "discord.js";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaEmbedBuilder } from "#lib/extensions/embed-builder";
import { ImperiaSubcommand } from "#lib/extensions/subcommand";
import { mapToLanguageArray } from "#lib/resolvers/language-code";

export class GuildConfigurationCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.LoaderContext, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage the bot's configuration for this server.",
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
        return message.reply("Default");
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
            await resolveKey(message, "guildconfig:list_disabled_commands", {
                commands: disabledCommands.join(", "),
            }),
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

        return interaction.reply("Command enable");
    }

    public async messageCommandEnable(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Command enable");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputCommandDisable(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Command disable");
    }

    public async messageCommandDisable(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Command disable");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputPrefixList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Prefix list");
    }

    public async messagePrefixList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Prefix list");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputPrefixSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Prefix set");
    }

    public async messagePrefixSet(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Prefix set");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputPrefixReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Prefix reset");
    }

    public async messagePrefixReset(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Prefix reset");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputLanguageList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Language list");
    }

    public async messageLanguageList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Language list");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputLanguageSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Language set");
    }

    public async messageLanguageSet(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Language set");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputLanguageReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        return interaction.reply("Language reset");
    }

    public async messageLanguageReset(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        return message.reply("Language reset");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        return interaction.reply("Reset");
    }
}
