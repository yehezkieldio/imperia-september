import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { DEVELOPMENT_SERVERS } from "#lib/configuration";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaSubcommand } from "#lib/extensions/subcommand";

export class TestSubCommandCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.LoaderContext, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            name: "test-subcommand",
            description: "Test subcommand",
            preconditions: [ImperiaIdentifiers.DeveloperUserOnly],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            subcommands: [
                {
                    type: "method",
                    name: "first",
                    chatInputRun: "chatInputFirst",
                },
            ],
        });
    }

    public override registerApplicationCommands(registry: ImperiaSubcommand.Registry): void {
        /**
         * Using a separate builder variable (SlashCommandBuilder) like other commands,
         * seems to broke registration of subcommands
         *
         * Currently, after testing and debugging, the only way to register subcommands is to register them directly
         * inside the main command builder
         *
         * Spent my morning and a coffee on this, but it's working now :) - 09/18/2024
         */
        registry.registerChatInputCommand(
            (builder) =>
                builder
                    .setName("test-subcommand")
                    .setDescription("Test subcommand")
                    .addSubcommand((command) => command.setName("first").setDescription("First subcommand")),
            {
                guildIds: DEVELOPMENT_SERVERS,
            },
        );
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputFirst(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        return interaction.reply("First subcommand");
    }
}
