import { Listener, type MessageCommandErrorPayload, type UserError } from "@sapphire/framework";
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
        const { logger } = this.container;
        const { message } = payload;

        logger.debug(`MessageCommandErrorListener: ${error.identifier}`);

        return message.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
