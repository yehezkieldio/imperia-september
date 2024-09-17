import { Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";
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
        const { message } = payload;
        if (!message.guildId) return;

        this.container.logger.debug(`MessageCommandDeniedListener: ${error.identifier}`);

        const response: string = await this.container.services.response.commandDenied(message.guildId, error);

        return message.reply({
            content: await this.container.utilities.bot.getResponse(response, message),
        });
    }
}
