import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class ChatInputCommadDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        const { logger, services } = this.container;
        const { interaction } = payload;

        logger.debug(`ChatInputCommadDeniedListener: ${error.identifier}`);

        const response: string = services.response.generateDeniedResponse(error);

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: response,
                allowedMentions: { users: [interaction.user.id], roles: [] },
            });
        }

        return interaction.reply({
            content: response,
            allowedMentions: { users: [interaction.user.id], roles: [] },
            ephemeral: true,
        });
    }
}
