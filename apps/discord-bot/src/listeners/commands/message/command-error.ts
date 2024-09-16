import { Listener, type MessageCommandErrorPayload, type UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: UserError, payload: MessageCommandErrorPayload) {
        const { logger, services, utilities } = this.container;
        const { message } = payload;

        logger.debug(`MessageCommandErrorListener: ${error.identifier}`);

        const response: string = services.response.generateDeniedResponse(error);

        return message.reply({
            content: utilities.bot.isATranslationKey(response) ? await resolveKey(message, response) : response,
        });
    }
}
