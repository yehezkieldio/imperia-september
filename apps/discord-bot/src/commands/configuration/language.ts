import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type Message, PermissionFlagsBits } from "discord.js";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaSubcommand } from "#lib/extensions/subcommand";
import { mapToLanguageArray } from "#lib/resolvers/language-code";

export class LanguageCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.LoaderContext, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage how the bot speaks in your server.",
            preconditions: [ImperiaIdentifiers.DeveloperUserOnly],
            requiredClientPermissions: [PermissionFlagsBits.ManageGuild],
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
                                        .setName("language")
                                        .setDescription("The language to set")
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
        return interaction.reply("chatInputList subcommand");
    }

    public async messageList(message: Message) {
        return message.reply("messageList subcommand");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputSet(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        return interaction.reply("chatInputSet subcommand");
    }

    public async messageSet(message: Message) {
        return message.reply("messageSet subcommand");
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputReset(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        return interaction.reply("chatInputReset subcommand");
    }

    public async messageReset(message: Message) {
        return message.reply("messageReset subcommand");
    }
}
