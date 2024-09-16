import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
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
        const { logger, services, utilities } = this.container;
        const { interaction } = payload;

        logger.debug(`ChatInputCommadDeniedListener: ${error.identifier}`);

        const response: string = services.response.generateDeniedResponse(error);

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: utilities.bot.isATranslationKey(response) ? await resolveKey(interaction, response) : response,
                allowedMentions: { users: [interaction.user.id], roles: [] },
            });
        }

        return interaction.reply({
            content: utilities.bot.isATranslationKey(response) ? await resolveKey(interaction, response) : response,
            allowedMentions: { users: [interaction.user.id], roles: [] },
            ephemeral: true,
        });
    }
}
