import { type Args, type ChatInputCommand, Listener } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import type { ChatInputSubcommandNoMatchContext } from "@sapphire/plugin-subcommands";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class ChatInputSubcommandNoMatchListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputSubcommandNoMatch,
        });
    }

    public async run(
        interaction: ChatInputCommand.Interaction,
        _args: Args,
        _context: ChatInputSubcommandNoMatchContext,
    ) {
        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: await resolveKey(interaction, "response:no_subcommand_match"),
            });
        }

        return interaction.reply({
            content: await resolveKey(interaction, "response:no_subcommand_match"),
            ephemeral: true,
        });
    }
}
