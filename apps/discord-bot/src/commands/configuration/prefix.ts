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

export class PrefixCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.LoaderContext, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage how the bot speaks in your server.",
            requiredUserPermissions: [PermissionFlagsBits.ManageGuild],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            name: "prefix",
            subcommands: [
                {
                    type: "method",
                    name: "list",
                    default: true,
                    messageRun: "messageList",
                    chatInputRun: "chatInputList",
                },
                {
                    type: "method",
                    name: "set",
                    chatInputRun: "chatInputSet",
                    messageRun: "messageSet",
                },
                {
                    type: "method",
                    name: "reset",
                    chatInputRun: "chatInputReset",
                    messageRun: "messageReset",
                },
            ],
        });
    }

    public override registerApplicationCommands(registry: ImperiaSubcommand.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) => command.setName("list").setDescription("The current prefix of the bot"))
                .addSubcommand((command) =>
                    command
                        .setName("set")
                        .setDescription("Set the bot's prefix")
                        .addStringOption((option) =>
                            option.setName("prefix").setDescription("The prefix to set").setRequired(true),
                        ),
                )
                .addSubcommand((command) => command.setName("reset").setDescription("Reset the bot's prefix")),
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

        const prefix: string = await this.container.utilities.guild.getPrefix(interaction.guild.id);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(interaction, "prefix:list_prefix", { prefix: prefix }));

        return interaction.reply({ embeds: [embed] });
    }

    public async messageList(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        const prefix: string = await this.container.utilities.guild.getPrefix(message.guild.id);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setDescription(await resolveKey(message, "prefix:list_prefix", { prefix: prefix }));

        return message.reply({ embeds: [embed] });
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(interaction, "response:server_only"),
            });
        }

        const prefix: string = interaction.options.getString("prefix", true);
        const currentPrefix: string = await this.container.utilities.guild.getPrefix(interaction.guild.id);

        if (currentPrefix === prefix) {
            return interaction.reply({
                content: await resolveKey(interaction, "prefix:already_set", {
                    prefix: prefix,
                }),
            });
        }

        await this.container.utilities.guild.setPrefix(interaction.guild.id, prefix);

        return interaction.reply({
            content: await resolveKey(interaction, "prefix:set", {
                prefix: prefix,
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

        const prefixArgument: ResultType<string> = await args.pickResult("string");

        if (prefixArgument.isErr()) {
            const error: UserError | ArgumentError<string> = prefixArgument.unwrapErr();

            // If the argument provided is invalid, we'll throw an error.
            if (error.identifier === ImperiaIdentifiers.CommandServiceError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.ArgsMissing,
                    message: await resolveKey(message, "prefix:invalid_prefix"),
                });
            }

            // If the argument provided is missing, we'll throw an error.
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "prefix:no_prefix"),
            });
        }

        const currentPrefix: string = await this.container.utilities.guild.getPrefix(message.guild.id);
        const prefix = prefixArgument.unwrap();

        if (currentPrefix === prefix) {
            return message.reply({
                content: await resolveKey(message, "prefix:already_set", {
                    prefix: prefix,
                }),
            });
        }

        await this.container.utilities.guild.setPrefix(message.guild.id, prefix);

        return message.reply({
            content: await resolveKey(message, "prefix:set", {
                prefix: prefix,
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

        await this.container.utilities.guild.resetPrefix(interaction.guild.id);

        return interaction.reply({
            content: await resolveKey(interaction, "prefix:reset"),
        });
    }

    public async messageReset(message: Message) {
        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: await resolveKey(message, "response:server_only"),
            });
        }

        await this.container.utilities.guild.resetPrefix(message.guild.id);

        return message.reply({
            content: await resolveKey(message, "prefix:reset"),
        });
    }
}
