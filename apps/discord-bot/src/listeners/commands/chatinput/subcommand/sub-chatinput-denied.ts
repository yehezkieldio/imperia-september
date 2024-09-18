import { Listener, type UserError } from "@sapphire/framework";
import type { ChatInputSubcommandDeniedPayload } from "@sapphire/plugin-subcommands";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class ChatInputSubcommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputSubcommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputSubcommandDeniedPayload) {
        const { interaction } = payload;
        if (!interaction.guildId) return;

        this.container.logger.debug(`ChatInputSubcommandDeniedListener: ${error.identifier}`);

        const response: string = await this.container.services.response.commandDenied(interaction.guildId, error);

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: await this.container.utilities.bot.getResponse(response, interaction),
                allowedMentions: { users: [interaction.user.id], roles: [] },
            });
        }

        return interaction.reply({
            content: await this.container.utilities.bot.getResponse(response, interaction),
            allowedMentions: { users: [interaction.user.id], roles: [] },
            ephemeral: true,
        });
    }
}
