import { Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload) {
        const { logger, services, utilities } = this.container;
        const { message } = payload;

        logger.debug(`MessageCommandDeniedListener: ${error.identifier}`);

        if (!message.guildId) return;

        const response: string = await services.response.commandDenied(message.guildId, error);

        return message.reply({
            content: utilities.bot.isATranslationKey(response) ? await resolveKey(message, response) : response,
        });
    }
}
